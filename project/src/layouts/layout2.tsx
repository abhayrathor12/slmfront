export const generateLayout2HTML = ({
    headerText, l2HeaderBg, l2HeaderText, l2SidebarBg, l2SidebarText, l2MainBg,
    l2MainText, l2FooterBg, l2FooterText, l2BorderColor, mainTitle, introText,
    point1Title, point1Desc, videoUrl, introBgColor
  }: {
    headerText: string;
    l2HeaderBg: string;
    l2HeaderText: string;
    l2SidebarBg: string;
    l2SidebarText: string;
    l2MainBg: string;
    l2MainText: string;
    l2FooterBg: string;
    l2FooterText: string;
    l2BorderColor: string;
    mainTitle: string;
    introText: string;
    point1Title: string;
    point1Desc: string;
    videoUrl: string;
    introBgColor: string;
  }) => {
    return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Custom Page Design - Layout 2</title>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; }
      .container { display: grid; grid-template-areas: 'header header' 'sidebar main' 'footer footer'; grid-template-columns: 250px 1fr; gap: 20px; padding: 20px; min-height: 100vh; }
      .header { grid-area: header; background: ${l2HeaderBg}; color: ${l2HeaderText}; padding: 30px; border-radius: 10px; border: 2px solid ${l2BorderColor}; }
      .sidebar { grid-area: sidebar; background: ${l2SidebarBg}; color: ${l2SidebarText}; padding: 25px; border-radius: 10px; border: 2px solid ${l2BorderColor}; }
      .main { grid-area: main; background: ${l2MainBg}; color: ${l2MainText}; padding: 30px; border-radius: 10px; border: 2px solid ${l2BorderColor}; }
      .footer { grid-area: footer; background: ${l2FooterBg}; color: ${l2FooterText}; padding: 25px; border-radius: 10px; border: 2px solid ${l2BorderColor}; }
      @media (max-width: 768px) { .container { grid-template-areas: 'header' 'sidebar' 'main' 'footer'; grid-template-columns: 1fr; } }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1 style="font-size: 2em; font-weight: 700;">${headerText}</h1>
      </div>
      <div class="sidebar">
        <h3 style="margin-bottom: 15px; font-weight: 600;">Navigation</h3>
        <p style="line-height: 1.8;">${point1Desc}</p>
      </div>
      <div class="main">
        <h2 style="margin-bottom: 20px; font-weight: 700;">${mainTitle}</h2>
        <p style="margin-bottom: 20px; line-height: 1.8;">${introText}</p>
        <div style="background: ${introBgColor}; padding: 20px; border-radius: 8px; border-left: 4px solid ${l2BorderColor};">
          <h4 style="margin-bottom: 10px; font-weight: 600;">${point1Title}</h4>
          <p>${point1Desc}</p>
        </div>
      </div>
      <div class="footer">
        ${videoUrl ? `
        <div style="margin-bottom: 15px;">
          <h4 style="margin-bottom: 10px; font-weight: 600;">Featured Video</h4>
          <div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; border-radius: 8px;">
            <iframe src="${videoUrl}" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none;" allow="autoplay; fullscreen"></iframe>
          </div>
        </div>` : '<p>Add video URL to display media content</p>'}
      </div>
    </div>
  </body>
  </html>`;
  };