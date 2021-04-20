import { Literal } from "rdflib";
import { SolidNodeClient } from "solid-node-client";
import { Shape } from "../../lib";
import {
  chatShex,
  ChatShape,
  ChatShapeType,
  ChatShapeContext,
  chat,
  chatMessage,
} from "../resources/shex";
const config = require("dotenv").config();

const webId = "https://lalatest.solidcommunity.net/profile/card#me";
const testDoc = "https://lalatest.solidcommunity.net/test/createChat";
const chatIri = "https://lalatest.solidcommunity.net/test/createChat#";
const firstChatIri = chatIri + "first";
const secondChatIri = chatIri + "second";
const badlyConfiguredChat = new Shape<ChatShape>({
  id: "https://shaperepo.com/schemas/longChat#ChatShape",
  shape: chatShex,
  context: { ...ChatShapeContext, created: "terms:created" },
  type: ChatShapeType,
});

function clean() {
  return chat.delete({
    doc: testDoc,
    where: {
      id: firstChatIri,
    },
  });
}

describe(".create()", () => {
  beforeAll(async () => {
    const client = new SolidNodeClient();
    await client.login(config);
    chat.fetcher._fetch = client.fetch.bind(client);
    chatMessage.fetcher._fetch = client.fetch.bind(client);
    await clean();
  });

  it("can create one shape", async () => {
    const shape = await chat.create({
      doc: testDoc,
      data: {
        id: firstChatIri,
        type: ChatShapeType.LongChat,
        title: "Test Chat",
        author: webId,
        created: new Date(),
      },
    });
    const { from, data, errors } = shape;
    expect(errors).toBeUndefined();
    expect(data).toBeDefined();
    expect(from).toBe(testDoc);
    expect(data.title).toBe("Test Chat");
    expect(data.author).toBe(webId);
    expect(data.type).toBe(ChatShapeType.LongChat);
  });

  it("can create one shape without type", async () => {
    const now = new Date()
    const message = await chatMessage.create({
      doc: testDoc,
      data: {
        id: chatIri + now.getMilliseconds(),
        content: "Test Message",
        maker: webId,
        created: now,
      },
    });
    const { from, data, errors } = message;
    expect(errors).toBeUndefined();
    expect(data).toBeDefined();
    expect(from).toBe(testDoc);
    expect(data.content).toBe("Test Message");
    expect(data.maker).toBe(webId);
  });

  it("throws error when data doesn't match cardinality", async () => {
    const shape = await chat.create({
      doc: testDoc,
      data: {
        id: secondChatIri,
        type: ChatShapeType.LongChat,
        title: (["Test Chat", "UpdatedChat"] as unknown) as string,
        author: webId,
        created: new Date(),
      },
    });
    const { from, data, errors } = shape;
    expect(from).toBe(testDoc);
    expect(data).toBeUndefined();
    expect(errors).toBeDefined();
    expect(errors.join("\n")).toContain("exceeds cardinality");
  });

  it("throws error when shape with id already exists in doc", async () => {
    const shape = await chat.create({
      doc: testDoc,
      data: {
        id: firstChatIri,
        type: ChatShapeType.LongChat,
        title: "Test Chat",
        author: webId,
        created: new Date(),
      },
    });
    const { from, data, errors } = shape;
    expect(from).toBe(testDoc);
    expect(data).toBeUndefined();
    expect(errors).toBeDefined();
    expect(errors).toStrictEqual([
      "Node with id: https://lalatest.solidcommunity.net/test/createChat#first already exists in doc:https://lalatest.solidcommunity.net/test/createChat",
    ]);
  });

  it("throws error when data doesn't match shex", async () => {
    const shape = await chat.create({
      doc: testDoc,
      data: {
        id: secondChatIri,
        type: ChatShapeType.LongChat,
        title: "Test Chat",
        author: webId,
        created: new Literal(new Date().toISOString()),
      },
    });
    const { from, data, errors } = shape;
    expect(from).toBe(testDoc);
    expect(data).toBeUndefined();
    expect(errors).toBeDefined();
    expect(errors.join("\n")).toContain("mismatched datatype");
  });

  it("throws error when validating and context doesn't match", async () => {
    const shape = await badlyConfiguredChat.create({
      doc: testDoc,
      data: {
        id: secondChatIri,
        type: ChatShapeType.LongChat,
        title: "Test Chat",
        author: webId,
        created: new Date(),
      },
    });
    const { from, data, errors } = shape;
    expect(from).toBe(testDoc);
    expect(data).toBeUndefined();
    expect(errors).toBeDefined();
    expect(errors).toStrictEqual([
      "validating https://lalatest.solidcommunity.net/test/createChat#second as https://shaperepo.com/schemas/longChat#ChatShape:",
      "    Missing property: http://purl.org/dc/elements/1.1/created",
    ]);
  });
});
