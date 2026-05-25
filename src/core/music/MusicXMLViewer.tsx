import { WebView } from "react-native-webview"

interface MusicXMLViewerProps {
  musicXML: string
  style?: object
  scrollEnabled?: boolean
  zoomEnabled?: boolean
}

export function MusicXMLViewer({
  musicXML,
  style,
  scrollEnabled = false,
  zoomEnabled = false,
}: MusicXMLViewerProps) {
  const htmlContent = `
<!doctype html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <script src="https://unpkg.com/opensheetmusicdisplay@1.9.5/build/opensheetmusicdisplay.min.js"></script>
    <style>
      html,
      body {
        margin: 0;
        padding: 0;
        width: 100%;
        height: 100%;
      }

      #osmd-container {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    </style>
  </head>
  <body>
    <div id="osmd-container"></div>
    <script>
      const osmd = new opensheetmusicdisplay.OpenSheetMusicDisplay(
        "osmd-container",
        {
          backend: "svg",

          autoResize: true,
          autoBeam: true,

          drawingParameters: "compacttight",
          drawMeasureNumbers: false,
        },
      );

      // https://github.com/opensheetmusicdisplay/opensheetmusicdisplay/issues/1372
      osmd.EngravingRules.PageBottomMargin = 0.3

      function fitScoreToContainer() {
        const container = document.getElementById("osmd-container");
        const svg = container && container.querySelector("svg");

        if (!container || !svg || !svg.getBBox) {
          return;
        }

        const bounds = svg.getBBox();
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        const padding = 16;
        const paddedWidth = bounds.width + padding * 2;
        const paddedHeight = bounds.height + padding * 2;

        if (
          bounds.width <= 0 ||
          bounds.height <= 0 ||
          containerWidth <= 0 ||
          containerHeight <= 0
        ) {
          return;
        }

        const scale = Math.min(
          1,
          containerWidth / paddedWidth,
          containerHeight / paddedHeight,
        );

        svg.setAttribute(
          "viewBox",
          [
            bounds.x - padding,
            bounds.y - padding,
            paddedWidth,
            paddedHeight,
          ].join(" "),
        );
        svg.style.width = paddedWidth * scale + "px";
        svg.style.height = paddedHeight * scale + "px";
        svg.style.maxWidth = "100%";
        svg.style.maxHeight = "100%";
        svg.style.display = "block";
      }

      osmd
        .load(${JSON.stringify(musicXML)})
        .then(function () {
          osmd.render();
          requestAnimationFrame(fitScoreToContainer);
        });
    </script>
  </body>
</html>
  `

  return (
    <WebView
      style={[style]}
      originWhitelist={["*"]}
      source={{ html: htmlContent }}
      scrollEnabled={scrollEnabled}
      zoomEnabled={zoomEnabled}
    />
  )
}
