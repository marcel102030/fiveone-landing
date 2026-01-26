import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const envPath = join(process.cwd(), ".env.local");
if (!existsSync(envPath)) {
  console.error("Missing .env.local with Supabase credentials.");
  process.exit(1);
}

const envText = readFileSync(envPath, "utf8");
const getEnv = (key) => {
  const match = envText.match(new RegExp(`^${key}=(.*)$`, "m"));
  return match ? match[1].trim().replace(/^['"]|['"]$/g, "") : "";
};

const supabaseUrl = getEnv("VITE_SUPABASE_URL");
const supabaseAnonKey = getEnv("VITE_SUPABASE_ANON_KEY");

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env.local.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false },
});

const members = [
  {
    id: "11111111-1111-1111-1111-111111111111",
    full_name: "Lucas Rocha",
    email: "lucas.rocha@rede.local",
    phone: "83999990001",
    birthdate: "1986-04-18",
    gender: "M",
    city: "Campina Grande",
    state: "PB",
    address: "Rua A, 120",
    status: "ativo",
    notes: "seed",
  },
  {
    id: "22222222-2222-2222-2222-222222222222",
    full_name: "Maria Souza",
    email: "maria.souza@rede.local",
    phone: "83999990002",
    birthdate: "1990-09-02",
    gender: "F",
    city: "Campina Grande",
    state: "PB",
    address: "Rua B, 45",
    status: "ativo",
    notes: "seed",
  },
  {
    id: "33333333-3333-3333-3333-333333333333",
    full_name: "Joao Pedro",
    email: "joao.pedro@rede.local",
    phone: "83999990003",
    birthdate: "1988-12-11",
    gender: "M",
    city: "Joao Pessoa",
    state: "PB",
    address: "Rua C, 78",
    status: "ativo",
    notes: "seed",
  },
];

const presbiteros = [
  {
    id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    member_id: "11111111-1111-1111-1111-111111111111",
    since_date: "2021-06-10",
    status: "ativo",
    notes: "seed",
  },
  {
    id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
    member_id: "22222222-2222-2222-2222-222222222222",
    since_date: "2022-03-05",
    status: "ativo",
    notes: "seed",
  },
  {
    id: "cccccccc-cccc-cccc-cccc-cccccccccccc",
    member_id: "33333333-3333-3333-3333-333333333333",
    since_date: "2023-01-15",
    status: "ativo",
    notes: "seed",
  },
];

const houses = [
  {
    id: "dddddddd-dddd-dddd-dddd-dddddddddddd",
    name: "Casa Centro",
    city: "Campina Grande",
    neighborhood: "Centro",
    address: "Rua Principal, 120",
    meeting_day: "Quarta",
    meeting_time: "19:30",
    capacity: 20,
    status: "ativa",
    presbitero_id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    notes: "seed",
  },
  {
    id: "eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee",
    name: "Casa Norte",
    city: "Campina Grande",
    neighborhood: "Catole",
    address: "Rua Nova, 45",
    meeting_day: "Terca",
    meeting_time: "20:00",
    capacity: 18,
    status: "ativa",
    presbitero_id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
    notes: "seed",
  },
  {
    id: "ffffffff-ffff-ffff-ffff-ffffffffffff",
    name: "Casa Sul",
    city: "Joao Pessoa",
    neighborhood: "Bancarios",
    address: "Rua das Flores, 78",
    meeting_day: "Quinta",
    meeting_time: "19:00",
    capacity: 16,
    status: "em_formacao",
    presbitero_id: "cccccccc-cccc-cccc-cccc-cccccccccccc",
    notes: "seed",
  },
];

const houseMembers = [
  {
    id: "10101010-1010-1010-1010-101010101010",
    house_id: "dddddddd-dddd-dddd-dddd-dddddddddddd",
    member_id: "11111111-1111-1111-1111-111111111111",
    role: "presbitero",
    is_primary: true,
    joined_at: "2021-07-01",
  },
  {
    id: "20202020-2020-2020-2020-202020202020",
    house_id: "eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee",
    member_id: "22222222-2222-2222-2222-222222222222",
    role: "presbitero",
    is_primary: true,
    joined_at: "2022-04-01",
  },
  {
    id: "30303030-3030-3030-3030-303030303030",
    house_id: "ffffffff-ffff-ffff-ffff-ffffffffffff",
    member_id: "33333333-3333-3333-3333-333333333333",
    role: "presbitero",
    is_primary: true,
    joined_at: "2023-02-01",
  },
];

const gifts = [
  { member_id: "11111111-1111-1111-1111-111111111111", gift: "pastor", source: "seed" },
  { member_id: "22222222-2222-2222-2222-222222222222", gift: "profeta", source: "seed" },
  { member_id: "33333333-3333-3333-3333-333333333333", gift: "mestre", source: "seed" },
];

const leaders = [
  {
    id: "aaaaaaaa-1111-1111-1111-111111111111",
    member_id: "11111111-1111-1111-1111-111111111111",
    ministry: "pastor",
    region: "Campina Grande",
    status: "ativo",
    notes: "seed",
  },
  {
    id: "bbbbbbbb-2222-2222-2222-222222222222",
    member_id: "22222222-2222-2222-2222-222222222222",
    ministry: "profeta",
    region: "Campina Grande",
    status: "ativo",
    notes: "seed",
  },
  {
    id: "cccccccc-3333-3333-3333-333333333333",
    member_id: "33333333-3333-3333-3333-333333333333",
    ministry: "mestre",
    region: "Joao Pessoa",
    status: "ativo",
    notes: "seed",
  },
];

const questionnaires = [
  {
    member_id: "11111111-1111-1111-1111-111111111111",
    wants_preach_house: true,
    wants_preach_network: true,
    wants_bible_study: true,
    wants_open_house: false,
    wants_be_presbitero: true,
    wants_be_ministry_leader: false,
    wants_discipleship: true,
    wants_serve_worship: true,
    wants_serve_intercession: true,
    wants_serve_children: false,
    wants_serve_media: false,
    available_for_training: true,
    available_for_missions: true,
    notes: "seed",
  },
  {
    member_id: "22222222-2222-2222-2222-222222222222",
    wants_preach_house: true,
    wants_preach_network: false,
    wants_bible_study: true,
    wants_open_house: true,
    wants_be_presbitero: false,
    wants_be_ministry_leader: true,
    wants_discipleship: true,
    wants_serve_worship: false,
    wants_serve_intercession: true,
    wants_serve_children: true,
    wants_serve_media: true,
    available_for_training: true,
    available_for_missions: false,
    notes: "seed",
  },
  {
    member_id: "33333333-3333-3333-3333-333333333333",
    wants_preach_house: false,
    wants_preach_network: false,
    wants_bible_study: true,
    wants_open_house: false,
    wants_be_presbitero: false,
    wants_be_ministry_leader: false,
    wants_discipleship: true,
    wants_serve_worship: true,
    wants_serve_intercession: false,
    wants_serve_children: false,
    wants_serve_media: true,
    available_for_training: true,
    available_for_missions: true,
    notes: "seed",
  },
];

const upsert = async (table, rows, onConflict) => {
  const { error } = await supabase.from(table).upsert(rows, {
    onConflict,
    ignoreDuplicates: true,
    returning: "minimal",
  });
  if (error) throw error;
};

const run = async () => {
  await upsert("rede_member", members, "email");
  await upsert("rede_presbitero", presbiteros, "member_id");
  await upsert("rede_house_church", houses, "id");
  await upsert("rede_house_member", houseMembers, "house_id,member_id");
  await upsert("rede_member_gift", gifts, "member_id,gift");
  await upsert("rede_ministry_leader", leaders, "member_id,ministry");
  await upsert("rede_member_questionnaire", questionnaires, "member_id");
};

run()
  .then(() => {
    console.log("Seed completed.");
  })
  .catch((err) => {
    console.error("Seed failed:", err?.message ?? err);
    process.exit(1);
  });
