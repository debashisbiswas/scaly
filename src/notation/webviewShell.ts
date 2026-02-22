export interface NotationWebViewErrorMessage {
  type: "notation-error"
  source: string
  message: string
  stack?: string
}

export function buildNotationWebViewHtml(params: {
  source: string
  scriptBody: string
}) {
  const { source, scriptBody } = params

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
        function postToNative(payload) {
          try {
            if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
              window.ReactNativeWebView.postMessage(JSON.stringify(payload));
            }
          } catch (_error) {}
        }

        function reportError(error) {
          const message = error && error.message ? error.message : String(error);
          postToNative({
            type: "notation-error",
            source: ${JSON.stringify(source)},
            message: message,
            stack: error && error.stack ? error.stack : undefined,
          });
        }

        window.addEventListener("error", function (event) {
          reportError(event.error || new Error(event.message || "Unknown notation error"));
        });

        window.addEventListener("unhandledrejection", function (event) {
          reportError(event.reason || new Error("Unhandled promise rejection"));
        });

        try {
          ${scriptBody}
        } catch (error) {
          reportError(error);
        }
      })();
    </script>
  </body>
</html>`
}
