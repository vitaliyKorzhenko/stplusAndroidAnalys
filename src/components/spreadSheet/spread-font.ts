/*
    Font parsing utils from legacy spread6.js code
*/

export const spreadDefFontSize = 10; // Use from preferences
export const spreadDefFont = "Arial";// Use from preferences

// parse float (int font size)
export function parseFontSize(fontSize: string) {
    return parseFloat(fontSize).toFixed(0).toLocaleString().replace(/\.?0+$/, '');
}


// parse CSS font string into object
export function parseFontString(font: string) {
    var fontFamily = null,
        fontSize = null,
        fontStyle = "normal",
        fontWeight = "normal",
        fontVariant = "normal",
        lineHeight = "normal";

    var elements = font.split(/\s+/);
    let element;
    outer: while (element = elements.shift()) {
        switch (element) {
            case "normal":
                break;

            case "italic":
            case "oblique":
                fontStyle = element;
                break;

            case "small-caps":
                fontVariant = element;
                break;

            case "bold":
            case "bolder":
            case "lighter":
            case "100":
            case "200":
            case "300":
            case "400":
            case "500":
            case "600":
            case "700":
            case "800":
            case "900":
                fontWeight = element;
                break;

            default:
                if (!fontSize) {
                    var parts = element.split("/");
                    fontSize = parts[0];
                    if (parts.length > 1) lineHeight = parts[1];
                    break;
                }

                fontFamily = element;
                if (elements.length)
                    fontFamily += " " + elements.join(" ");
                break outer;
        }
    }
    if (!fontFamily)
        fontFamily = spreadDefFont;
    if (!fontSize)
        fontSize = spreadDefFontSize;

    return {
        "fontStyle": fontStyle,
        "fontVariant": fontVariant,
        "fontWeight": fontWeight,
        "fontSize": fontSize,
        "lineHeight": lineHeight,
        "fontFamily": fontFamily
    };
}

// selects size from font size selector (in pt). if option
export function matchFontSizeToPt(sizeStr: string) {
    let sz = parseInt(sizeStr, 10);
    if ((sizeStr.indexOf("px") > 0))
    {
        sz = Math.round(sz * 72 / 96);
    }
    if (sz < 5 || sz > 96) sz = spreadDefFontSize;
    return sz;
}