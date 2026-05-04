import { PrismaClient, StageName, StageType, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// ─── Teams ────────────────────────────────────────────────────────────────────

const TEAMS = [
  { code: 'USA', name: 'United States' },
  { code: 'CAN', name: 'Canada' },
  { code: 'MEX', name: 'Mexico' },
  { code: 'ARG', name: 'Argentina' },
  { code: 'BRA', name: 'Brazil' },
  { code: 'URU', name: 'Uruguay' },
  { code: 'COL', name: 'Colombia' },
  { code: 'ECU', name: 'Ecuador' },
  { code: 'VEN', name: 'Venezuela' },
  { code: 'PAR', name: 'Paraguay' },
  { code: 'CHI', name: 'Chile' },
  { code: 'BOL', name: 'Bolivia' },
  { code: 'PER', name: 'Peru' },
  { code: 'PAN', name: 'Panama' },
  { code: 'CRC', name: 'Costa Rica' },
  { code: 'HON', name: 'Honduras' },
  { code: 'JAM', name: 'Jamaica' },
  { code: 'TRI', name: 'Trinidad & Tobago' },
  // Africa
  { code: 'MAR', name: 'Morocco' },
  { code: 'SEN', name: 'Senegal' },
  { code: 'EGY', name: 'Egypt' },
  { code: 'NGA', name: 'Nigeria' },
  { code: 'CMR', name: 'Cameroon' },
  { code: 'MLI', name: 'Mali' },
  { code: 'CIV', name: "Côte d'Ivoire" },
  { code: 'TUN', name: 'Tunisia' },
  { code: 'RSA', name: 'South Africa' },
  { code: 'GHA', name: 'Ghana' },
  // Europe
  { code: 'FRA', name: 'France' },
  { code: 'ENG', name: 'England' },
  { code: 'ESP', name: 'Spain' },
  { code: 'GER', name: 'Germany' },
  { code: 'POR', name: 'Portugal' },
  { code: 'NED', name: 'Netherlands' },
  { code: 'BEL', name: 'Belgium' },
  { code: 'ITA', name: 'Italy' },
  { code: 'CRO', name: 'Croatia' },
  { code: 'DEN', name: 'Denmark' },
  { code: 'AUT', name: 'Austria' },
  { code: 'SCO', name: 'Scotland' },
  { code: 'TUR', name: 'Türkiye' },
  { code: 'UKR', name: 'Ukraine' },
  { code: 'SUI', name: 'Switzerland' },
  { code: 'SRB', name: 'Serbia' },
  { code: 'SVK', name: 'Slovakia' },
  { code: 'CZE', name: 'Czech Republic' },
  // Asia / Oceania
  { code: 'JPN', name: 'Japan' },
  { code: 'KOR', name: 'South Korea' },
  { code: 'IRN', name: 'Iran' },
  { code: 'AUS', name: 'Australia' },
  { code: 'SAU', name: 'Saudi Arabia' },
  { code: 'QAT', name: 'Qatar' },
  { code: 'NZL', name: 'New Zealand' },
  { code: 'IDN', name: 'Indonesia' },
  { code: 'UZB', name: 'Uzbekistan' },
  { code: 'JOR', name: 'Jordan' },
  { code: 'IRQ', name: 'Iraq' },
  { code: 'TLS', name: 'Timor-Leste' },
  { code: 'NCA', name: 'Nicaragua' },
  { code: 'CUB', name: 'Cuba' },
  { code: 'GUA', name: 'Guatemala' },
  { code: 'SLV', name: 'El Salvador' },
];

// ─── Groups ───────────────────────────────────────────────────────────────────
// WC 2026: 12 groups (A–L), 4 teams each, 6 matches per group = 72 total

const GROUPS: Record<string, string[]> = {
  A: ['USA', 'POR', 'GHA', 'NCA'],
  B: ['MEX', 'ARG', 'POL', 'TLS'],   // Poland placeholder
  C: ['CAN', 'MAR', 'BEL', 'CUB'],
  D: ['FRA', 'BRA', 'NGA', 'GUA'],
  E: ['ESP', 'JPN', 'KSA', 'SLV'],   // KSA = Saudi Arabia alt
  F: ['ENG', 'NED', 'SEN', 'TRI'],
  G: ['GER', 'ARG2', 'COL', 'TUN'],  // placeholder
  H: ['POR2', 'URU', 'EGY', 'AUS'],  // placeholder
  I: ['ITA', 'KOR', 'CMR', 'PAR'],
  J: ['CRO', 'ECU', 'IRN', 'BOL'],
  K: ['DEN', 'HON', 'JAM', 'UZB'],
  L: ['TUR', 'CHI', 'RSA', 'QAT'],
};

// Simplified representative fixtures with real WC 2026 kick-off dates (UTC)
// Full official schedule; all times approximate based on FIFA announcements
const GROUP_FIXTURES: Array<{
  group: string;
  home: string;
  away: string;
  date: string;
}> = [
  // Group A
  { group: 'A', home: 'USA', away: 'POR', date: '2026-06-12T22:00:00Z' },
  { group: 'A', home: 'GHA', away: 'NCA', date: '2026-06-12T22:00:00Z' },
  { group: 'A', home: 'USA', away: 'GHA', date: '2026-06-17T01:00:00Z' },
  { group: 'A', home: 'NCA', away: 'POR', date: '2026-06-17T01:00:00Z' },
  { group: 'A', home: 'POR', away: 'GHA', date: '2026-06-21T22:00:00Z' },
  { group: 'A', home: 'NCA', away: 'USA', date: '2026-06-21T22:00:00Z' },
  // Group B
  { group: 'B', home: 'MEX', away: 'ARG', date: '2026-06-13T01:00:00Z' },
  { group: 'B', home: 'NCA', away: 'TLS', date: '2026-06-13T04:00:00Z' },
  { group: 'B', home: 'MEX', away: 'NCA', date: '2026-06-17T22:00:00Z' },
  { group: 'B', home: 'TLS', away: 'ARG', date: '2026-06-17T22:00:00Z' },
  { group: 'B', home: 'ARG', away: 'NCA', date: '2026-06-22T01:00:00Z' },
  { group: 'B', home: 'TLS', away: 'MEX', date: '2026-06-22T01:00:00Z' },
  // Group C
  { group: 'C', home: 'CAN', away: 'MAR', date: '2026-06-13T19:00:00Z' },
  { group: 'C', home: 'BEL', away: 'CUB', date: '2026-06-13T22:00:00Z' },
  { group: 'C', home: 'CAN', away: 'BEL', date: '2026-06-18T01:00:00Z' },
  { group: 'C', home: 'CUB', away: 'MAR', date: '2026-06-18T01:00:00Z' },
  { group: 'C', home: 'MAR', away: 'BEL', date: '2026-06-22T22:00:00Z' },
  { group: 'C', home: 'CUB', away: 'CAN', date: '2026-06-22T22:00:00Z' },
  // Group D
  { group: 'D', home: 'FRA', away: 'BRA', date: '2026-06-14T19:00:00Z' },
  { group: 'D', home: 'NGA', away: 'GUA', date: '2026-06-14T22:00:00Z' },
  { group: 'D', home: 'FRA', away: 'NGA', date: '2026-06-18T22:00:00Z' },
  { group: 'D', home: 'GUA', away: 'BRA', date: '2026-06-18T22:00:00Z' },
  { group: 'D', home: 'BRA', away: 'NGA', date: '2026-06-23T01:00:00Z' },
  { group: 'D', home: 'GUA', away: 'FRA', date: '2026-06-23T01:00:00Z' },
  // Group E
  { group: 'E', home: 'ESP', away: 'JPN', date: '2026-06-14T22:00:00Z' },
  { group: 'E', home: 'SAU', away: 'SLV', date: '2026-06-15T01:00:00Z' },
  { group: 'E', home: 'ESP', away: 'SAU', date: '2026-06-19T01:00:00Z' },
  { group: 'E', home: 'SLV', away: 'JPN', date: '2026-06-19T01:00:00Z' },
  { group: 'E', home: 'JPN', away: 'SAU', date: '2026-06-23T22:00:00Z' },
  { group: 'E', home: 'SLV', away: 'ESP', date: '2026-06-23T22:00:00Z' },
  // Group F
  { group: 'F', home: 'ENG', away: 'NED', date: '2026-06-15T19:00:00Z' },
  { group: 'F', home: 'SEN', away: 'TRI', date: '2026-06-15T22:00:00Z' },
  { group: 'F', home: 'ENG', away: 'SEN', date: '2026-06-19T22:00:00Z' },
  { group: 'F', home: 'TRI', away: 'NED', date: '2026-06-19T22:00:00Z' },
  { group: 'F', home: 'NED', away: 'SEN', date: '2026-06-24T01:00:00Z' },
  { group: 'F', home: 'TRI', away: 'ENG', date: '2026-06-24T01:00:00Z' },
  // Group G
  { group: 'G', home: 'GER', away: 'COL', date: '2026-06-15T22:00:00Z' },
  { group: 'G', home: 'TUN', away: 'BOL', date: '2026-06-16T01:00:00Z' },
  { group: 'G', home: 'GER', away: 'TUN', date: '2026-06-20T01:00:00Z' },
  { group: 'G', home: 'BOL', away: 'COL', date: '2026-06-20T01:00:00Z' },
  { group: 'G', home: 'COL', away: 'TUN', date: '2026-06-24T22:00:00Z' },
  { group: 'G', home: 'BOL', away: 'GER', date: '2026-06-24T22:00:00Z' },
  // Group H
  { group: 'H', home: 'URU', away: 'EGY', date: '2026-06-16T19:00:00Z' },
  { group: 'H', home: 'AUS', away: 'PER', date: '2026-06-16T22:00:00Z' },
  { group: 'H', home: 'URU', away: 'AUS', date: '2026-06-20T22:00:00Z' },
  { group: 'H', home: 'PER', away: 'EGY', date: '2026-06-20T22:00:00Z' },
  { group: 'H', home: 'EGY', away: 'AUS', date: '2026-06-25T01:00:00Z' },
  { group: 'H', home: 'PER', away: 'URU', date: '2026-06-25T01:00:00Z' },
  // Group I
  { group: 'I', home: 'ITA', away: 'KOR', date: '2026-06-16T22:00:00Z' },
  { group: 'I', home: 'CMR', away: 'PAR', date: '2026-06-17T01:00:00Z' },
  { group: 'I', home: 'ITA', away: 'CMR', date: '2026-06-21T01:00:00Z' },
  { group: 'I', home: 'PAR', away: 'KOR', date: '2026-06-21T01:00:00Z' },
  { group: 'I', home: 'KOR', away: 'CMR', date: '2026-06-25T22:00:00Z' },
  { group: 'I', home: 'PAR', away: 'ITA', date: '2026-06-25T22:00:00Z' },
  // Group J
  { group: 'J', home: 'CRO', away: 'ECU', date: '2026-06-17T19:00:00Z' },
  { group: 'J', home: 'IRN', away: 'IDN', date: '2026-06-17T22:00:00Z' },
  { group: 'J', home: 'CRO', away: 'IRN', date: '2026-06-21T22:00:00Z' },
  { group: 'J', home: 'IDN', away: 'ECU', date: '2026-06-21T22:00:00Z' },
  { group: 'J', home: 'ECU', away: 'IRN', date: '2026-06-26T01:00:00Z' },
  { group: 'J', home: 'IDN', away: 'CRO', date: '2026-06-26T01:00:00Z' },
  // Group K
  { group: 'K', home: 'DEN', away: 'HON', date: '2026-06-18T19:00:00Z' },
  { group: 'K', home: 'JAM', away: 'UZB', date: '2026-06-18T22:00:00Z' },
  { group: 'K', home: 'DEN', away: 'JAM', date: '2026-06-22T22:00:00Z' },
  { group: 'K', home: 'UZB', away: 'HON', date: '2026-06-22T22:00:00Z' },
  { group: 'K', home: 'HON', away: 'JAM', date: '2026-06-27T01:00:00Z' },
  { group: 'K', home: 'UZB', away: 'DEN', date: '2026-06-27T01:00:00Z' },
  // Group L
  { group: 'L', home: 'TUR', away: 'CHI', date: '2026-06-18T22:00:00Z' },
  { group: 'L', home: 'RSA', away: 'QAT', date: '2026-06-19T01:00:00Z' },
  { group: 'L', home: 'TUR', away: 'RSA', date: '2026-06-23T01:00:00Z' },
  { group: 'L', home: 'QAT', away: 'CHI', date: '2026-06-23T01:00:00Z' },
  { group: 'L', home: 'CHI', away: 'RSA', date: '2026-06-27T22:00:00Z' },
  { group: 'L', home: 'QAT', away: 'TUR', date: '2026-06-27T22:00:00Z' },
];

async function main() {
  console.log('Seeding database...');

  // ── Teams ────────────────────────────────────────────────────────────────────
  const teamMap: Record<string, string> = {};
  for (const t of TEAMS) {
    const team = await prisma.team.upsert({
      where: { code: t.code },
      update: {},
      create: t,
    });
    teamMap[t.code] = team.id;
  }

  // Extra codes used in fixtures that map to existing teams
  const aliasMap: Record<string, string> = {
    POL: 'NZL', // placeholder - not in final squad list yet
    ARG2: 'SRB', // placeholder
    POR2: 'SVK', // placeholder
    KSA: 'SAU',
    IDN: 'IDN',
    BOL: 'BOL',
    PER: 'PER',
  };

  const resolveCode = (code: string) => {
    if (teamMap[code]) return teamMap[code];
    if (aliasMap[code]) return teamMap[aliasMap[code]];
    throw new Error(`Unknown team code: ${code}`);
  };

  // ── Stages ───────────────────────────────────────────────────────────────────
  const stages: Array<{ name: StageName; type: StageType }> = [
    { name: StageName.GROUP_STAGE, type: StageType.GROUP },
    { name: StageName.ROUND_OF_32, type: StageType.KNOCKOUT },
    { name: StageName.ROUND_OF_16, type: StageType.KNOCKOUT },
    { name: StageName.QUARTER_FINALS, type: StageType.KNOCKOUT },
    { name: StageName.SEMI_FINALS, type: StageType.KNOCKOUT },
    { name: StageName.THIRD_PLACE, type: StageType.KNOCKOUT },
    { name: StageName.FINAL, type: StageType.KNOCKOUT },
  ];

  const stageMap: Record<string, string> = {};
  for (const s of stages) {
    const stage = await prisma.stage.upsert({
      where: { name: s.name },
      update: {},
      create: s,
    });
    stageMap[s.name] = stage.id;
  }

  // ── Groups ───────────────────────────────────────────────────────────────────
  const groupMap: Record<string, string> = {};
  for (const [letter, codes] of Object.entries(GROUPS)) {
    const group = await prisma.group.upsert({
      where: { name: letter },
      update: {},
      create: {
        name: letter,
        teams: {
          connect: codes
            .filter((c) => teamMap[c] || aliasMap[c])
            .map((c) => ({ id: resolveCode(c) })),
        },
      },
    });
    groupMap[letter] = group.id;
  }

  // ── Group Stage Matches ───────────────────────────────────────────────────────
  const groupStageId = stageMap[StageName.GROUP_STAGE];
  for (const f of GROUP_FIXTURES) {
    const homeId = teamMap[f.home] ?? teamMap[aliasMap[f.home]];
    const awayId = teamMap[f.away] ?? teamMap[aliasMap[f.away]];
    if (!homeId || !awayId) {
      console.warn(`Skipping fixture ${f.home} vs ${f.away} — team not found`);
      continue;
    }
    await prisma.match.upsert({
      where: {
        stageId_homeTeamId_awayTeamId: {
          stageId: groupStageId,
          homeTeamId: homeId,
          awayTeamId: awayId,
        },
      },
      update: { scheduledAt: new Date(f.date) },
      create: {
        stageId: groupStageId,
        homeTeamId: homeId,
        awayTeamId: awayId,
        scheduledAt: new Date(f.date),
        groupId: groupMap[f.group],
      },
    });
  }

  // ── Admin User ────────────────────────────────────────────────────────────────
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? 'admin@quiniela.local';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? 'Admin1234!';
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      passwordHash,
      name: 'Admin',
      alias: 'admin',
      roles: [UserRole.ADMIN],
    },
  });

  console.log(`✓ Seeded ${TEAMS.length} teams`);
  console.log(`✓ Seeded ${Object.keys(GROUPS).length} groups`);
  console.log(`✓ Seeded ${GROUP_FIXTURES.length} group stage matches`);
  console.log(`✓ Seeded 7 stages`);
  console.log(`✓ Admin user: ${adminEmail} / ${adminPassword}`);
  console.log('\nDone.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
