import { useEffect, useMemo, useRef, useState } from "react"
import { View } from "react-native"
import { WebView } from "react-native-webview"

import {
  buildNotationWebViewHtml,
  NotationWebViewErrorMessage,
} from "@/notation/webviewShell"

interface RangeStaffProps {
  leftNoteKey: string
  rightNoteKey: string
  width: number
  height?: number
}

function buildHtml({
  leftNoteKey,
  rightNoteKey,
  width,
  height,
}: {
  leftNoteKey: string
  rightNoteKey: string
  width: number
  height: number
}) {
  return buildNotationWebViewHtml({
    source: "RangeStaff",
    scriptBody: `
      const VF = window.VexFlow;
      const WIDTH = ${Math.round(width)};
      const HEIGHT = ${Math.round(height)};
      const INITIAL_LEFT = ${JSON.stringify(leftNoteKey)};
      const INITIAL_RIGHT = ${JSON.stringify(rightNoteKey)};
      let fontsReady = false;
      let queuedLeft = INITIAL_LEFT;
      let queuedRight = INITIAL_RIGHT;

      function draw(leftKey, rightKey) {
        if (!fontsReady) {
          queuedLeft = leftKey;
          queuedRight = rightKey;
          return;
        }

        const scoreElement = document.getElementById("score");
        scoreElement.innerHTML = "";

        const factory = new VF.Factory({
          renderer: { elementId: "score", width: WIDTH, height: HEIGHT },
        });

        const system = factory.System({
          x: 10,
          y: 22,
          width: WIDTH - 20,
        });

        function buildNote(noteKey) {
          const text = String(noteKey || "c/4");
          const parts = text.split("/");

          if (parts.length !== 2) {
            return factory.StaveNote({ keys: ["c/4"], duration: "h" });
          }

          const pitch = parts[0];
          const octave = parts[1];
          const match = pitch.match(/^([a-g])(#{1,2}|b{1,2})?$/i);

          if (!match) {
            return factory.StaveNote({ keys: ["c/4"], duration: "h" });
          }

          const baseKey = match[1].toLowerCase() + "/" + octave;
          const accidental = match[2] || null;
          const note = factory.StaveNote({ keys: [baseKey], duration: "h", autoStem: true });

          if (accidental) {
            try {
              note.addModifier(new VF.Accidental(accidental), 0);
            } catch (_error) {}
          }

          return note;
        }

        const voice = factory
          .Voice({ numBeats: 2, beatValue: 2 })
          .addTickables([buildNote(leftKey), buildNote(rightKey)]);

        system.addStave({ voices: [voice] }).addClef("treble");
        factory.draw();
      }

      window.updateNotes = function updateNotes(leftKey, rightKey) {
        draw(leftKey, rightKey);
      };

      VF.loadFonts("Bravura", "Academico")
        .then(function () {
          VF.setFonts("Bravura", "Academico");
          fontsReady = true;
          draw(queuedLeft, queuedRight);
        })
        .catch(function () {
          fontsReady = true;
          draw(queuedLeft, queuedRight);
        });
    `,
  })
}

export default function RangeStaff({
  leftNoteKey,
  rightNoteKey,
  width,
  height = 190,
}: RangeStaffProps) {
  const webViewRef = useRef<WebView>(null)
  const initialLeftNoteKeyRef = useRef(leftNoteKey)
  const initialRightNoteKeyRef = useRef(rightNoteKey)
  const [isWebViewReady, setIsWebViewReady] = useState(false)

  const html = useMemo(
    () =>
      buildHtml({
        leftNoteKey: initialLeftNoteKeyRef.current,
        rightNoteKey: initialRightNoteKeyRef.current,
        width,
        height,
      }),
    [width, height],
  )

  useEffect(() => {
    if (!isWebViewReady || !webViewRef.current) {
      return
    }

    webViewRef.current.injectJavaScript(
      `window.updateNotes(${JSON.stringify(leftNoteKey)}, ${JSON.stringify(rightNoteKey)}); true;`,
    )
  }, [isWebViewReady, leftNoteKey, rightNoteKey])

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
        key={`${Math.round(width)}-${Math.round(height)}`}
        ref={webViewRef}
        source={{ html }}
        originWhitelist={["*"]}
        onLoadStart={() => setIsWebViewReady(false)}
        onLoadEnd={() => setIsWebViewReady(true)}
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
