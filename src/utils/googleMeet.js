import { google } from "googleapis";

// Setup auth client with OAuth2 or Service Account
export function getMeetClient(auth) {
  return google.meet({ version: "v2", auth });
}

// Example: get all recordings for a given conference (meeting) ID
export async function getMeetRecordings(auth, conferenceRecordId) {
  const meet = getMeetClient(auth);

  const res = await meet.conferenceRecords.recordings.list({
    parent: `conferenceRecords/${conferenceRecordId}`,
  });

  return res.data.recordings || [];
}

// Example: get transcript entries
export async function getMeetTranscripts(auth, conferenceRecordId, transcriptId) {
  const meet = getMeetClient(auth);

  const res = await meet.conferenceRecords.transcripts.entries.list({
    parent: `conferenceRecords/${conferenceRecordId}/transcripts/${transcriptId}`,
  });

  return res.data.transcriptEntries || [];
}
