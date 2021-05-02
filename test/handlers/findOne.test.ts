import {
  solidProfile,
} from "../resources/shex";

describe(".findOne()", () => {
  it("can find one shape", async () => {
    const testIri = "https://lalatest.solidcommunity.net/profile/card#me";
    const shape = await solidProfile.findOne({
      doc: testIri,
      where: { id: testIri },
    });
    const { doc, data } = shape;
    expect(doc).toBe(testIri);
    expect(data.name).toBe("Tester");
    expect(data["foaf:name"]).toBe("Tester");
    expect(data.hasEmail["vcard:value"]).toBe(
      "mailto:lalasepp@gmail.com"
    );
  });

  it("should return an error for finding the wrong shape", async () => {
    const testIri = "https://lalatest.solidcommunity.net/profile";
    const { errors } = await solidProfile.findOne({
      doc: testIri,
      where: { id: testIri },
    });
    expect(errors).toBeDefined();
    expect(errors).toStrictEqual([
      "validating https://lalatest.solidcommunity.net/profile as https://shaperepo.com/schemas/solidProfile#SolidProfileShape:",
      "    Missing property: http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
      "  OR",
      "  Missing property: http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
    ]);
  });
});
