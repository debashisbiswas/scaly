import { useMemo } from "react"
import { View } from "react-native"
import { WebView } from "react-native-webview"

import {
  buildNotationWebViewHtml,
  NotationWebViewErrorMessage,
} from "@/notation/webviewShell"

interface PracticeStaffProps {
  mode: "full" | "rhythm"
  width: number
  height: number
}

function buildHtml({
  mode,
  width,
  height,
}: {
  mode: "full" | "rhythm"
  width: number
  height: number
}) {
  return buildNotationWebViewHtml({
    source: "PracticeStaff",
    scriptBody: `
      const VF = window.VexFlow;
      const MODE = ${JSON.stringify(mode)};
      const WIDTH = ${Math.round(width)};
      const HEIGHT = ${Math.round(height)};

      function createScaleNotes(factory, keys, duration) {
        return keys.map(function (key) {
          return factory.StaveNote({ keys: [key], duration: duration });
        });
      }

      function drawFull(factory) {
        const ascending = createScaleNotes(
          factory,
          [
            "c/4", "d/4", "e/4", "f/4", "g/4", "a/4", "b/4", "c/5",
            "d/5", "e/5", "f/5", "g/5", "a/5", "b/5", "c/6",
          ],
          "16",
        );

        const descending = [
          "c/6", "b/5", "a/5", "g/5", "f/5", "e/5", "d/5", "c/5",
          "b/4", "a/4", "g/4", "f/4", "e/4", "d/4",
        ].map(function (key) {
          return factory.StaveNote({ keys: [key], duration: "16" });
        });
        descending.push(factory.StaveNote({ keys: ["c/4"], duration: "q" }));

        const voiceOne = factory
          .Voice({ numBeats: 4, beatValue: 4 })
          .addTickables(ascending);
        const voiceTwo = factory
          .Voice({ numBeats: 4, beatValue: 4 })
          .addTickables(descending);

        const topSystem = factory.System({ x: 8, y: 10, width: WIDTH - 16 });
        const bottomSystem = factory.System({ x: 8, y: 92, width: WIDTH - 16 });

        topSystem.addStave({ voices: [voiceOne] }).addClef("treble").addTimeSignature("7/4");
        bottomSystem.addStave({ voices: [voiceTwo] }).addClef("treble");

        const topBeams = VF.Beam.generateBeams(ascending, { groups: [new VF.Fraction(2, 8)] });
        const bottomBeams = VF.Beam.generateBeams(descending.slice(0, 14), {
          groups: [new VF.Fraction(2, 8)],
        });

        factory.draw();
        const context = factory.getContext();

        topBeams.forEach(function (beam) {
          beam.setContext(context).draw();
        });
        bottomBeams.forEach(function (beam) {
          beam.setContext(context).draw();
        });
      }

      function drawRhythm(factory) {
        const notes = [
          factory.StaveNote({ keys: ["c/4"], duration: "8" }),
          factory.StaveNote({ keys: ["d/4"], duration: "16" }),
          factory.StaveNote({ keys: ["e/4"], duration: "16" }),
          factory.StaveNote({ keys: ["f/4"], duration: "16" }),
          factory.StaveNote({ keys: ["g/4"], duration: "16" }),
          factory.StaveNote({ keys: ["a/4"], duration: "16" }),
          factory.StaveNote({ keys: ["b/4"], duration: "16" }),
          factory.StaveNote({ keys: ["c/5"], duration: "8" }),
          factory.StaveNote({ keys: ["b/4"], duration: "16" }),
          factory.StaveNote({ keys: ["a/4"], duration: "16" }),
          factory.StaveNote({ keys: ["g/4"], duration: "16" }),
          factory.StaveNote({ keys: ["f/4"], duration: "16" }),
          factory.StaveNote({ keys: ["e/4"], duration: "16" }),
          factory.StaveNote({ keys: ["d/4"], duration: "16" }),
        ];

        const voice = factory.Voice({ numBeats: 4, beatValue: 4 }).addTickables(notes);
        const system = factory.System({ x: 8, y: 10, width: WIDTH - 16 });
        system.addStave({ voices: [voice] }).addClef("treble").addTimeSignature("4/4");

        const beams = VF.Beam.generateBeams(notes, {
          groups: [
            new VF.Fraction(4, 16),
            new VF.Fraction(4, 16),
            new VF.Fraction(4, 16),
            new VF.Fraction(4, 16),
          ],
        });

        factory.draw();
        const context = factory.getContext();
        beams.forEach(function (beam) {
          beam.setContext(context).draw();
        });
      }

      function render() {
        const scoreElement = document.getElementById("score");
        scoreElement.innerHTML = "";

        const factory = new VF.Factory({
          renderer: { elementId: "score", width: WIDTH, height: HEIGHT },
        });

        if (MODE === "full") {
          drawFull(factory);
        } else {
          drawRhythm(factory);
        }
      }

      VF.loadFonts("Bravura", "Academico")
        .then(function () {
          VF.setFonts("Bravura", "Academico");
          render();
        })
        .catch(function () {
          render();
        });
    `,
  })
}

export default function PracticeStaff({
  mode,
  width,
  height,
}: PracticeStaffProps) {
  const html = useMemo(
    () => buildHtml({ mode, width, height }),
    [mode, width, height],
  )

  if (width <= 0) {
    return null
  }

  return (
    <View
      style={{
        width,
        height,
        overflow: "hidden",
      }}
    >
      <WebView
        source={{ html }}
        originWhitelist={["*"]}
        onMessage={(event) => handleWebViewMessage(event.nativeEvent.data)}
        style={{ backgroundColor: "transparent" }}
        scrollEnabled={false}
      />
    </View>
  )
}
function handleWebViewMessage(rawMessage: string) {
  try {
    const payload = JSON.parse(rawMessage) as NotationWebViewErrorMessage
    if (payload.type !== "notation-error") {
      return
    }

    console.error(
      `[${payload.source}] ${payload.message}`,
      payload.stack ? `\n${payload.stack}` : "",
    )
  } catch {
    // Ignore malformed postMessage payloads.
  }
}
