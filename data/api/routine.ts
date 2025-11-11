import type { Routine, RoutineData, RoutineOccurence } from "../types/routine";
import {
  APIFile,
  decode,
  readFileFromAPI,
  readFileFromCDN,
  updateFileWithSHA,
} from "./repo";

export type UpdateRoutineResponse = {
  ok: boolean;
  data?: RoutineData;
};

const BASE_ROUTINE_PATH = "routines.json";

export async function getRoutineData(): Promise<RoutineData> {
  const response = await readFileFromCDN(BASE_ROUTINE_PATH);
  if (response === undefined) return {};
  return response as RoutineData;
}

export async function performRoutine(
  slug: string,
  actor: string,
  lastModified?: string,
): Promise<UpdateRoutineResponse> {
  const apiFile: APIFile | undefined = await readFileFromAPI(BASE_ROUTINE_PATH);
  if (apiFile === undefined) return { ok: false };
  const currentDate = new Date();
  const occurnece = {
    actor: actor,
    date: currentDate.toISOString(),
  } as RoutineOccurence;

  const content = JSON.parse(decode(apiFile.content)) as RoutineData;

  if (!content) return { ok: false };

  // TODO: Implement last modified check with alerts.. right now this literally force pushes lool
  // if (lastModified !== undefined) {
  //   const localLastModified: Date = parseISO(lastModified);
  //   const fileLastModified: Date = parseISO(content.);
  // }

  content[slug].times.push(occurnece);

  try {
    await updateFileWithSHA(
      BASE_ROUTINE_PATH,
      content,
      `Performed routine: ${slug}`,
      apiFile.sha,
    );
  } catch (e) {
    console.error(e);
    return { ok: false };
  }
  return { ok: true, data: content };
}
