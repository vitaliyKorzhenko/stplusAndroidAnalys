/*

    Temporary class to work with clipboard

    Clipboard issues:
    https://support.microsoft.com/en-us/office/copy-and-paste-in-office-for-the-web-682704da-8360-464c-9a26-ff44abf4c4fe

    https://stackabuse.com/how-to-copy-to-clipboard-in-javascript-with-the-clipboard-api/
    
    https://phiilu.com/accessing-the-clipboard-in-javascript-using-the-clipboard-api

*/

export class Clipboard {

  static isSupported = () => {
    return (
      !!navigator.clipboard ||
      (typeof document.execCommand === 'function' &&
        typeof document.queryCommandSupported === 'function' &&
        document.queryCommandSupported('copy'))
    );
  }

  public static copy = async (): Promise<void> => {
    console.error('navigator.clipboard', !!navigator.clipboard)
    document.execCommand('copy');
    //await navigator.clipboard.writeText(data);
  }

  public static paste = async (): Promise<string> => {
    return navigator.clipboard.readText(); //'text/plain'
  }
}

