import FastAverageColor from "fast-average-color";

const FastAverageColorInstance = new FastAverageColor();

async function getBackgroundColor(coverImageURL: string): Promise<string> {
  let color = await FastAverageColorInstance.getColorAsync(coverImageURL);
  return darkenColor(color.hex, 40);
}

function darkenColor(color: string, percent: number): string {
  let colorObject: any = {
    red: parseInt(color.slice(1, 3), 16),
    green: parseInt(color.slice(3, 5), 16),
    blue: parseInt(color.slice(5, 7), 16),
  };

  for (let key of Object.keys(colorObject)) {
    colorObject[key] = Math.floor((colorObject[key] * (100 - percent)) / 100);
    colorObject[key] = colorObject[key] < 255 ? colorObject[key] : 255;
    colorObject[key] =
      colorObject[key].toString(16).length == 1
        ? `0${colorObject[key].toString(16)}`
        : colorObject[key].toString(16);
  }

  return `#${colorObject.red}${colorObject.green}${colorObject.blue}`;
}

export { getBackgroundColor, darkenColor };
