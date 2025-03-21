export function generateColorFromString(string: string) {
    const hash = string.split('').reduce((acc, char) => {
        const charCode = char.charCodeAt(0);
        return acc + charCode;
    }, 0);

    const hue = hash % 360;
    const saturation = 0.8;
    const lightness = 0.5;

    return `hsl(${hue}, ${saturation * 100}%, ${lightness * 100}%)`;
}

