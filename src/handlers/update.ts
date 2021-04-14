import { Statement, UpdateManager } from "rdflib";
import { QueryResult, Shape } from "../shape";
import { validateNewShape } from "./create";

export interface UpdateArgs<ShapeType> {
  doc: string;
  data: Partial<ShapeType> & { id: string };
}

export async function update<ShapeType>(
  shape: Shape<ShapeType>,
  { doc, data }: UpdateArgs<ShapeType>
): Promise<QueryResult<ShapeType>> {
  return new Promise(async (resolve, reject) => {
    await shape.fetcher
      .load(doc, { clearPreviousData: true })
      .catch((err) => resolve({ from: doc, errors: [err] }));
    const [del, ins] = await shape.dataToStatements(data, doc);
    const [newShapes, errors] = await validateNewShape<ShapeType>(
      shape,
      data.id,
      del,
      ins
    );
    if (!newShapes || errors) {
      resolve({ from: doc, errors });
    } else {
      await updateExisting(shape.updater, del, ins)
        .catch((err) => reject(err))
        .then(() => {
          resolve({ from: doc, data: newShapes[0], errors });
        });
    }
  });
}

function updateExisting(
  updater: UpdateManager,
  del: Statement[],
  ins: Statement[]
): Promise<void> {
  return new Promise((resolve, reject) => {
    updater.update(del, ins, async (_uri, ok, error) => {
      !ok ? reject(error) : resolve();
    });
  });
}