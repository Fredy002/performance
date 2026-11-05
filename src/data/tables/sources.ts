/** The historical supplement matches the supplied scans; later editions differ. */
const FAA_7C = 'https://aviationexplorer.com/FAA_Pilot_Training_Testing_Manuals/Computer%20Testing%20Supplement%20for%20Airline%20Transport%20Pilot%20and%20Aircraft%20Dispatcher%20%28FAA-CT-8080-7C%29.pdf';

export const SOURCE_EDITION = 'FAA-CT-8080-7C (2005), Apéndice 2';

export function historicalReferences(page: number) {
  return [{ label: `Suplemento FAA 2005 · página PDF ${page} (copia archivada)`, url: `${FAA_7C}#page=${page}` }];
}
