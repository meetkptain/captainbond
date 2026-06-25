import { NextResponse } from 'next/server';
import { withApiHandler } from '@/lib/api/withApiHandler';
import { syncQuestionsFromCsv } from '@/services/questionService';
import { adminSyncLimiter } from '@/lib/rate-limit';
import { requireAdminOrSyncAuth } from '@/lib/auth/admin';
import { AppError } from '@/lib/errors';

export const runtime = 'edge';

export const POST = withApiHandler({
  rateLimit: adminSyncLimiter,
  async handler({ req }) {
    await requireAdminOrSyncAuth(req);

    const sheetCsvUrl = process.env.GOOGLE_SHEETS_CSV_URL;
    if (!sheetCsvUrl) {
      return NextResponse.json(
        { error: 'Server configuration error: Google Sheets URL is not set.' },
        { status: 500 }
      );
    }

    // Authorization is handled by middleware (admin cookie or sync secret).
    // We still fetch the sheet here to keep the route responsible for I/O.
    const csvResponse = await fetch(sheetCsvUrl, { cache: 'no-store' });
    if (!csvResponse.ok) {
      throw new AppError('SERVICE_UNAVAILABLE', `Failed to fetch Google Sheet CSV: ${csvResponse.statusText}`);
    }

    const csvText = await csvResponse.text();
    const { count } = await syncQuestionsFromCsv(csvText);

    return NextResponse.json({
      success: true,
      message: `${count} questions synchronisées avec succès !`,
      count,
    });
  },
});
