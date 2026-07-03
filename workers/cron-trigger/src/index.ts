interface Env {
  CRON_SECRET: string;
  APP_URL: string;
}

interface ScheduledEvent {
  cron: string;
  scheduledTime: number;
}

const CRON_ROUTES: Array<{ cron: string; path: string }> = [
  { cron: "30 11 * * 1,3,5", path: "/api/cron/rituals" },
  { cron: "0 11 * * 1,3,5", path: "/api/cron/push-ritual-available" },
  { cron: "0 19 * * 1,3,5", path: "/api/cron/push-reveal-time" },
  { cron: "0 20 * * 0", path: "/api/cron/weekly-recap" },
  { cron: "0 2 * * 1", path: "/api/cron/heatmap" },
  { cron: "0 2 1 * *", path: "/api/cron/tree-progress" },
];

export default {
  async scheduled(event: ScheduledEvent, env: Env): Promise<void> {
    const matched = CRON_ROUTES.find((r) => r.cron === event.cron);
    if (!matched) {
      console.error(`Unknown cron: ${event.cron}`);
      return;
    }

    const url = `${env.APP_URL}${matched.path}`;
    console.log(`Triggering cron: ${matched.path}`);

    try {
      const res = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${env.CRON_SECRET}`,
        },
      });

      if (!res.ok) {
        const body = await res.text();
        console.error(`Cron failed: ${matched.path} - Status ${res.status} - ${body}`);
      } else {
        console.log(`Cron success: ${matched.path} - Status ${res.status}`);
      }
    } catch (err) {
      console.error(`Cron error: ${matched.path}`, err);
    }
  },
};
