import { useMemo } from "react"
import { View } from "react-native"
import { WebView } from "react-native-webview"

type SlurSpan = [number, number]

interface SlurPatternStaffProps {
  width: number
  slurSpans: SlurSpan[]
  height?: number
}

const NOTE_PATTERN = [
  { key: "c/4", duration: "8" },
  { key: "d/4", duration: "16" },
  { key: "e/4", duration: "16" },
  { key: "f/4", duration: "16" },
  { key: "g/4", duration: "16" },
  { key: "a/4", duration: "16" },
  { key: "b/4", duration: "16" },
  { key: "c/5", duration: "8" },
  { key: "b/4", duration: "16" },
  { key: "a/4", duration: "16" },
  { key: "g/4", duration: "16" },
  { key: "f/4", duration: "16" },
  { key: "e/4", duration: "16" },
  { key: "d/4", duration: "16" },
] as const

const BEAM_GROUPS = [
  [0, 1, 2],
  [3, 4, 5, 6],
  [7, 8, 9],
  [10, 11, 12, 13],
] as const

function buildHtml({
  width,
  height,
  slurSpans,
}: {
  width: number
  height: number
  slurSpans: SlurSpan[]
}) {
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <style>
      html, body {
        margin: 0;
        padding: 0;
        width: 100%;
        height: 100%;
        overflow: hidden;
        background: transparent;
      }

      #score {
        width: 100%;
        height: 100%;
      }
    </style>
  </head>
  <body>
    <div id="score"></div>
    <script src="https://cdn.jsdelivr.net/npm/vexflow@5.0.0/build/cjs/vexflow-core.js"></script>
    <script>
      (function () {
        const VF = window.VexFlow;
        const WIDTH = ${Math.round(width)};
        const HEIGHT = ${Math.round(height)};
        const NOTE_PATTERN = ${JSON.stringify(NOTE_PATTERN)};
        const BEAM_GROUPS = ${JSON.stringify(BEAM_GROUPS)};
        const SLUR_SPANS = ${JSON.stringify(slurSpans)};

        function renderScore() {
          const scoreElement = document.getElementById("score");
          scoreElement.innerHTML = "";

          const factory = new VF.Factory({
            renderer: { elementId: "score", width: WIDTH, height: HEIGHT },
          });

          const system = factory.System({
            x: 10,
            y: 12,
            width: WIDTH - 20,
          });

          const notes = NOTE_PATTERN.map(function (entry) {
            return factory.StaveNote({
              keys: [entry.key],
              duration: entry.duration,
            });
          });

          const voice = factory
            .Voice({ numBeats: 4, beatValue: 4 })
            .addTickables(notes);

          const beams = BEAM_GROUPS.map(function (group) {
            const groupNotes = group
              .map(function (index) {
                return notes[index];
              })
              .filter(Boolean);

            if (groupNotes.length > 1) {
              return new VF.Beam(groupNotes);
            }

            return null;
          }).filter(Boolean);

          system.addStave({ voices: [voice] }).addClef("treble");
          factory.draw();

          const context = factory.getContext();

          beams.forEach(function (beam) {
            beam.setContext(context).draw();
          });

          SLUR_SPANS.forEach(function (span) {
            const start = span[0];
            const end = span[1];
            const firstNote = notes[start];
            const lastNote = notes[end];

            if (!firstNote || !lastNote) {
              return;
            }

            try {
              const spanLength = end - start + 1;
              const curveHeight = Math.min(28, 12 + spanLength * 2);

              new VF.Curve(firstNote, lastNote, {
                invert: false,
                cps: [
                  { x: 0, y: curveHeight },
                  { x: 0, y: curveHeight },
                ],
                y_shift: -8,
              })
                .setContext(context)
                .draw();
            } catch (_error) {
              new VF.StaveTie({
                firstNote,
                lastNote,
                firstIndexes: [0],
                lastIndexes: [0],
              })
                .setContext(context)
                .draw();
            }
          });
        }

        VF.loadFonts("Bravura", "Academico")
          .then(function () {
            VF.setFonts("Bravura", "Academico");
            renderScore();
          })
          .catch(function () {
            renderScore();
          });
      })();
    </script>
  </body>
</html>`
}

export default function SlurPatternStaff({
  width,
  slurSpans,
  height = 132,
}: SlurPatternStaffProps) {
  const html = useMemo(
    () => buildHtml({ width, height, slurSpans }),
    [width, height, slurSpans],
  )

  if (width <= 0) {
    return null
  }

  return (
    <View
      style={{
        width,
        height,
        borderWidth: 1,
        borderColor: "#d0d0d0",
        borderRadius: 8,
        overflow: "hidden",
      }}
    >
      <WebView
        source={{ html }}
        originWhitelist={["*"]}
        style={{ backgroundColor: "transparent" }}
        scrollEnabled={false}
      />
    </View>
  )
}
