import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://guqmidkzfeqgxgerspjd.supabase.co';
const supabaseKey = 'sb_publishable_WOLqz0u9AgNOnMJXiOTb3w_f_EKd_Qf';

export const supabase = createClient(supabaseUrl, supabaseKey);