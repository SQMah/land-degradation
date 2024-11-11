import React from "react";

const IframeRenderer = (path: string) => {
  return (
    <iframe
      src={path}
      title="HTML Renderer"
      style={{
        width: "100%",
        height: "500px",
        border: "none",
      }}
    />
  );
};

export default IframeRenderer;
