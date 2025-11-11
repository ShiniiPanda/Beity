import base64 from "react-native-base64";

export async function readFileFromCDN<T>(
  path: string,
  sha: string | undefined = undefined,
): Promise<T | undefined> {
  const owner = process.env.EXPO_PUBLIC_GITHUB_NAME;
  const repo = process.env.EXPO_PUBLIC_GITHUB_REPO;
  const response = await fetch(
    `https://raw.githubusercontent.com/${owner}/${repo}/main/${path}`,
  );

  if (!response.ok) return undefined;
  const data = await response.json();
  return data as T;
}

export interface APIFile {
  name: string;
  path: string;
  sha: string;
  content: string;
  encoding: string;
}

export async function readFileFromAPI(
  path: string,
): Promise<APIFile | undefined> {
  const owner = process.env.EXPO_PUBLIC_GITHUB_NAME;
  const repo = process.env.EXPO_PUBLIC_GITHUB_REPO;
  const token = process.env.EXPO_PUBLIC_SECRET_KEY;
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) return undefined;
  const file = await response.json();

  return file as APIFile;
}

export async function readFileContentFromAPI<T>(
  path: string,
): Promise<T | undefined> {
  const response = await readFileFromAPI(path);
  if (response === undefined) return undefined;
  const decodedContent = decode(response.content);
  const content = JSON.parse(decodedContent) as T;
  return content;
}

export async function updateFile(
  path: string,
  newData: object,
  message: string = "Updated JSON file via WhatToEat Application",
) {
  const owner = process.env.EXPO_PUBLIC_GITHUB_NAME;
  const repo = process.env.EXPO_PUBLIC_GITHUB_REPO;
  const token = process.env.EXPO_PUBLIC_SECRET_KEY;
  const branch = "main";
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;

  const fetchResponse: APIFile | undefined = await readFileFromAPI(path);
  if (fetchResponse === undefined) throw new Error("Failed to reach API.");
  const sha = fetchResponse.sha;

  const encodedData = base64.encode(JSON.stringify(newData));

  const response = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: message,
      content: encodedData,
      sha,
      branch,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Failed to update file on github: ${err}`);
  }

  return await response.json();
}

export async function updateFileWithSHA(
  path: string,
  newData: object,
  message: string = "Updated JSON file via WhatToEat Application",
  sha: string,
) {
  const owner = process.env.EXPO_PUBLIC_GITHUB_NAME;
  const repo = process.env.EXPO_PUBLIC_GITHUB_REPO;
  const token = process.env.EXPO_PUBLIC_SECRET_KEY;
  const branch = "main";
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;

  const encodedData = base64.encode(JSON.stringify(newData));

  const response = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: message,
      content: encodedData,
      sha,
      branch,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Failed to update file on github: ${err}`);
  }

  return await response.json();
}

export function decode(data: string) {
  const cleanedData = data.replace(/\n/g, "").trim();
  return base64.decode(cleanedData);
}
