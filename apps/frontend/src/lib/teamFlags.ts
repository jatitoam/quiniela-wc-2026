/** Maps FIFA 3-letter codes → ISO 3166-1 alpha-2 codes for emoji flag generation. */
const FIFA_TO_ISO2: Record<string, string> = {
  // CONMEBOL
  ARG: 'AR', BOL: 'BO', BRA: 'BR', CHI: 'CL', COL: 'CO',
  CRC: 'CR', ECU: 'EC', MEX: 'MX', PAN: 'PA', PAR: 'PY',
  PER: 'PE', URU: 'UY', USA: 'US', VEN: 'VE',
  // UEFA
  ALB: 'AL', AND: 'AD', AUT: 'AT', BEL: 'BE', BIH: 'BA',
  BUL: 'BG', CRO: 'HR', CYP: 'CY', CZE: 'CZ', DEN: 'DK',
  ENG: 'GB', ESP: 'ES', FIN: 'FI', FRA: 'FR', GEO: 'GE',
  GER: 'DE', GRE: 'GR', HUN: 'HU', IRL: 'IE', ISL: 'IS',
  ISR: 'IL', ITA: 'IT', KAZ: 'KZ', KOS: 'XK', LTU: 'LT',
  LUX: 'LU', MDA: 'MD', MKD: 'MK', MLT: 'MT', MNE: 'ME',
  NED: 'NL', NIR: 'GB', NOR: 'NO', POL: 'PL', POR: 'PT',
  ROU: 'RO', SCO: 'GB', SLO: 'SI', SVK: 'SK', SRB: 'RS',
  SUI: 'CH', SWE: 'SE', TUR: 'TR', UKR: 'UA', WAL: 'GB',
  // CONCACAF
  CAN: 'CA', CUB: 'CU', GUA: 'GT', HAI: 'HT', HON: 'HN',
  JAM: 'JM', TRI: 'TT',
  // CAF
  ALG: 'DZ', ANG: 'AO', CMR: 'CM', CIV: 'CI', COD: 'CD',
  EGY: 'EG', ETH: 'ET', GAB: 'GA', GHA: 'GH', GUI: 'GN',
  KEN: 'KE', LIB: 'LY', MAR: 'MA', MOZ: 'MZ', NAM: 'NA',
  NGA: 'NG', RSA: 'ZA', SEN: 'SN', TAN: 'TZ', TUN: 'TN',
  UGA: 'UG', ZAM: 'ZM', ZIM: 'ZW',
  // AFC
  AUS: 'AU', BHR: 'BH', CHN: 'CN', IDN: 'ID', IND: 'IN',
  IRN: 'IR', IRQ: 'IQ', JOR: 'JO', JPN: 'JP', KOR: 'KR',
  KSA: 'SA', KUW: 'KW', LIB2: 'LB', MAS: 'MY', OMN: 'OM',
  PHI: 'PH', QAT: 'QA', SYR: 'SY', THA: 'TH', UAE: 'AE',
  UZB: 'UZ', VIE: 'VN',
  // OFC
  NZL: 'NZ',
};

function iso2ToEmoji(iso2: string): string {
  return [...iso2.toUpperCase()]
    .map(c => String.fromCodePoint(0x1f1e6 - 65 + c.charCodeAt(0)))
    .join('');
}

export function getTeamFlag(fifaCode: string): string {
  const iso2 = FIFA_TO_ISO2[fifaCode.toUpperCase()];
  if (!iso2) return '🏳';
  return iso2ToEmoji(iso2);
}

export function formatTeam(code: string, name?: string): string {
  return `${getTeamFlag(code)} ${name ?? code}`;
}
