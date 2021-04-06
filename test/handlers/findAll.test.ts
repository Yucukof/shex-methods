import { Shape } from "../../lib";
import {
  ResourceShape,
  solidLdpShex,
  ResourceContext,
  ResourceShapeType,
} from "../resources/findAll";

describe(".findAll()", () => {
  it("can find all instances of shape", async () => {
    const fromIri = "https://lalatest.solidcommunity.net/profile/";
    const testIri = "https://lalatest.solidcommunity.net/profile/card";
    const resource = new Shape<ResourceShape>({
      id: "http://www.w3.org/ns/ldp#ResourceShape",
      shape: solidLdpShex,
      context: ResourceContext,
      type: ResourceShapeType,
    });
    const shape = await resource.findAll({
      from: fromIri,
    });
    const { from, data, errors } = shape;
    const card = data[1] as ResourceShape;
    expect(errors).toBeUndefined();
    expect(from).toBe(fromIri);
    expect(card.id).toBe(testIri);
    expect(card.type[0]).toBe("http://www.w3.org/ns/ldp#Resource");
    // expect(data["foaf:name"][0]).toBe("Tester");
    // expect(data.hasEmail[0]["vcard:value"][0]).toBe(
    //   "mailto:lalasepp@gmail.com"
    // );
  });

  it("should return an error for finding the wrong shape", async () => {
    const fromIri = "https://lalatest.solidcommunity.net/profile/";
    const resource = new Shape<ResourceShape>({
      id: "http://www.w3.org/ns/ldp#ResourceShape",
      shape: solidLdpShex,
      context: ResourceContext,
      type: ResourceShapeType,
    });
    const { errors, data } = await resource.findAll({
      from: fromIri,
      where: { id: [fromIri] },
    });
    expect(errors).toBeDefined();
    expect(errors).toStrictEqual([
      "validating https://lalatest.solidcommunity.net/profile/ as http://www.w3.org/ns/ldp#ResourceShape:",
      "    Missing property: http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
      "  OR",
      "  Missing property: http://www.w3.org/ns/posix/stat#size",
      "  OR",
      "  Missing property: http://www.w3.org/ns/posix/stat#mtime",
      "  OR",
      "  Missing property: http://purl.org/dc/terms/modified",
    ]);
  });
});