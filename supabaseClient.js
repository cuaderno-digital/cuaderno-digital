import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabaseUrl = "https://ueiiyibsnmapzygpmeza.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVlaWl5aWJzbm1hcHp5Z3BtZXphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEzODc2NzMsImV4cCI6MjA2Njk2MzY3M30.8yDCfUXBhqeEyFvPL5Pz7W5WWlbK4N25UOEXx4n1hdo";

export const supabase = createClient(supabaseUrl, supabaseKey, {
    global: {
      headers: {
        'usuario_id': localStorage.getItem('usuario_id') || ''
      }
    }
  });
