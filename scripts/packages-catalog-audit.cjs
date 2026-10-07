require('@next/env').loadEnvConfig(process.cwd());
const { createClient } = require('@supabase/supabase-js');
(async () => {
  const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const { data, error } = await client.from('services').select('id,code,name,platform,rate,min,max,refill_policy,is_active,accepts_new_orders,health_status').eq('status', 'active').eq('is_active', true).eq('accepts_new_orders', true);
  if (error) throw new Error(error.message);
  const fs = require('node:fs');
  fs.mkdirSync('artifacts/packages-v2', { recursive: true });
  fs.writeFileSync('artifacts/packages-v2/catalog.json', JSON.stringify(data, null, 2));
  console.log(JSON.stringify({ count: data.length, platforms: [...new Set(data.map(row => row.platform))], coded: data.filter(row => row.code).length, withoutCode: data.filter(row => !row.code).map(row => row.name) }, null, 2));
})().catch(error => { console.error(error.message); process.exitCode = 1; });
