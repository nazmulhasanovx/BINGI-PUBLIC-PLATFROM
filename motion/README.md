# BinGi product loops (Remotion)

Short looping clips for the public site's bento cards. Source of `website/public/media/bento*.mp4`.

| Composition | Size | Shows |
|---|---|---|
| bentoCalendar | 1600×700 | A booking dragged from Room 102 to Room 201; toast confirms |
| bentoHousekeep | 800×700 | Check-out → room becomes "Needs cleaning" → cleaning task appears, gets assigned |
| bentoRestaurant | 1200×750 | POS order built, posted to Room 305; room bill gains a Restaurant line |
| bentoCash | 1200×750 | Today's payments arrive, totals by method, day closes with counted = expected |
| bentoStaff | 1200×750 | Attendance: check-ins, late, leave, shift bars |
| bentoWebsite | 2400×800 | Hotel website re-dressed NEST → CITY → ESCAPE → GRAND |

**Truth note:** these are designed motion illustrations in BinGi style with sample data (fictional names, "Your Hotel"). They are not screen recordings of the live HMS. Replace with real recordings when available, or match them to the final HMS screens.

Booking status, payment status and room readiness are shown as separate chips on purpose.

```bash
npm i
npx remotion studio                      # preview / edit
for c in bentoCalendar bentoHousekeep bentoRestaurant bentoCash bentoStaff bentoWebsite; do
  npx remotion render src/index.ts $c out/$c.mp4 --codec=h264 --crf=26 --x264-preset=veryfast --muted
done
cp out/*.mp4 ../website/public/media/
```
6 s seamless loops, 30 fps, ~1 MB total. On Linux servers without Remotion's bundled browser add `--browser-executable=/usr/bin/google-chrome`.
