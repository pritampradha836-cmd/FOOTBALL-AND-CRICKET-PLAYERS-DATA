import { getAccessToken } from './firebaseAuth';

export interface DriveSpreadsheet {
  id: string;
  name: string;
  modifiedTime: string;
  webViewLink?: string;
}

export interface SheetMetadata {
  id: string;
  title: string;
  sheets: {
    sheetId: number;
    title: string;
    rowCount?: number;
    columnCount?: number;
  }[];
}

export const listUserSpreadsheets = async (): Promise<DriveSpreadsheet[]> => {
  const token = await getAccessToken();
  if (!token) throw new Error('Not authenticated with Google');

  const query = encodeURIComponent("mimeType = 'application/vnd.google-apps.spreadsheet' and trashed = false");
  const url = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,modifiedTime,webViewLink)&orderBy=modifiedTime desc&pageSize=20`;

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to list spreadsheets: ${errorText}`);
  }

  const data = await response.json();
  return data.files || [];
};

export const getSpreadsheetMetadata = async (spreadsheetId: string): Promise<SheetMetadata> => {
  const token = await getAccessToken();
  if (!token) throw new Error('Not authenticated with Google');

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=spreadsheetId,properties.title,sheets.properties`;
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error(`Failed to load sheet metadata: ${await response.text()}`);
  }

  const data = await response.json();
  return {
    id: data.spreadsheetId,
    title: data.properties?.title || 'Untitled Spreadsheet',
    sheets: (data.sheets || []).map((s: any) => ({
      sheetId: s.properties.sheetId,
      title: s.properties.title,
      rowCount: s.properties.gridProperties?.rowCount,
      columnCount: s.properties.gridProperties?.columnCount,
    })),
  };
};

export const readSpreadsheetValues = async (
  spreadsheetId: string,
  range: string = 'A1:Z500'
): Promise<string[][]> => {
  const token = await getAccessToken();
  if (!token) throw new Error('Not authenticated with Google');

  const encodedRange = encodeURIComponent(range);
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodedRange}`;

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error(`Failed to read sheet data: ${await response.text()}`);
  }

  const data = await response.json();
  return data.values || [];
};

export const createTableauSpreadsheet = async (
  title: string,
  headers: string[],
  rows: (string | number)[][]
): Promise<{ id: string; url: string }> => {
  const token = await getAccessToken();
  if (!token) throw new Error('Not authenticated with Google');

  // 1. Create Spreadsheet
  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title: title || `Tableau Analytics Export - ${new Date().toLocaleDateString()}`,
      },
      sheets: [
        {
          properties: {
            title: 'Tableau Dashboard Data',
            gridProperties: {
              frozenRowCount: 1,
            },
          },
        },
      ],
    }),
  });

  if (!createRes.ok) {
    throw new Error(`Failed to create spreadsheet: ${await createRes.text()}`);
  }

  const created = await createRes.json();
  const spreadsheetId = created.spreadsheetId;
  const webViewLink = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  // 2. Populate values
  const values = [headers, ...rows];
  const updateRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Tableau%20Dashboard%20Data!A1?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ values }),
    }
  );

  if (!updateRes.ok) {
    console.warn('Values upload had warnings:', await updateRes.text());
  }

  // 3. Apply professional Tableau styling to Header Row
  try {
    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [
          {
            repeatCell: {
              range: {
                sheetId: created.sheets[0]?.properties?.sheetId || 0,
                startRowIndex: 0,
                endRowIndex: 1,
              },
              cell: {
                userEnteredFormat: {
                  backgroundColor: { red: 0.16, green: 0.38, blue: 0.58 }, // Tableau Navy
                  textFormat: {
                    bold: true,
                    foregroundColor: { red: 1, green: 1, blue: 1 },
                    fontSize: 10,
                  },
                  horizontalAlignment: 'CENTER',
                },
              },
              fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)',
            },
          },
          {
            autoResizeDimensions: {
              dimensions: {
                sheetId: created.sheets[0]?.properties?.sheetId || 0,
                dimension: 'COLUMNS',
                startIndex: 0,
                endIndex: headers.length,
              },
            },
          },
        ],
      }),
    });
  } catch (styleErr) {
    console.warn('Batch styling warning:', styleErr);
  }

  return { id: spreadsheetId, url: webViewLink };
};
