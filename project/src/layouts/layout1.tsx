export const generateLayout1HTML = ({
    headerBgColor, headerTextColor, headerText, sectionBgColor, sectionTitleColor, sectionTitle,
    videoUrl, mainBgColor, mainTitleColor, mainTitle, mainBorderColor, introBgColor,
    introTextColor, introText, cardBgColor, cardTextColor, point1Title, point1Desc,
    point2Title, point2Desc
  }: {
    headerBgColor: string;
    headerTextColor: string;
    headerText: string;
    sectionBgColor: string;
    sectionTitleColor: string;
    sectionTitle: string;
    videoUrl: string;
    mainBgColor: string;
    mainTitleColor: string;
    mainTitle: string;
    mainBorderColor: string;
    introBgColor: string;
    introTextColor: string;
    introText: string;
    cardBgColor: string;
    cardTextColor: string;
    point1Title: string;
    point1Desc: string;
    point2Title: string;
    point2Desc: string;
  }) => {
    return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Custom Page Design</title>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; line-height: 1.6; }
    </style>
  </head>
  <body>
    <div style="background: ${headerBgColor}; color: ${headerTextColor}; padding: 40px; text-align: center; border-radius: 10px; margin: 20px;">
      <h1 style="font-size: 2.5em; font-weight: 700; letter-spacing: -1px;">${headerText}</h1>
    </div>
    
    <div style="max-width: 1200px; margin: 20px auto; padding: 20px;">
      <div style="background: ${sectionBgColor}; border-radius: 20px; padding: 30px; margin-bottom: 30px; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);">
        <h2 style="color: ${sectionTitleColor}; font-size: 1.8em; margin-bottom: 20px; font-weight: 700;">${sectionTitle}</h2>
        ${videoUrl ? `
        <div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; border-radius: 15px; background: #000; box-shadow: 0 15px 40px rgba(0, 0, 0, 0.2);">
          <iframe src="${videoUrl}" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none;" allow="autoplay; fullscreen"></iframe>
        </div>` : '<div style="background: #f0f0f0; padding: 60px; text-align: center; border-radius: 15px; color: #999;">Video placeholder - Add video URL</div>'}
      </div>
      
      <div style="background: ${mainBgColor}; border-radius: 20px; padding: 50px; margin-bottom: 40px; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1); border: 3px solid ${mainBorderColor};">
        <h2 style="color: ${mainTitleColor}; margin-bottom: 25px; font-size: 2.5em; font-weight: 700;">${mainTitle}</h2>
        <p style="background: ${introBgColor}; color: ${introTextColor}; padding: 25px; border-radius: 10px; border-left: 5px solid ${mainBorderColor}; font-size: 1.1em; line-height: 1.8;">${introText}</p>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px; margin-top: 40px;">
          <div style="background: ${cardBgColor}; color: ${cardTextColor}; padding: 35px; border-radius: 15px; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);">
            <h4 style="margin-bottom: 15px; font-size: 1.6em; font-weight: 600;">${point1Title}</h4>
            <p style="font-size: 1.05em; line-height: 1.7; opacity: 0.95;">${point1Desc}</p>
          </div>
          <div style="background: ${cardBgColor}; color: ${cardTextColor}; padding: 35px; border-radius: 15px; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);">
            <h4 style="margin-bottom: 15px; font-size: 1.6em; font-weight: 600;">${point2Title}</h4>
            <p style="font-size: 1.05em; line-height: 1.7; opacity: 0.95;">${point2Desc}</p>
          </div>
        </div>
      </div>
    </div>
  </body>
  </html>`;
  };