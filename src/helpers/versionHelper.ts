//version helper

export class VersionHelper {

    private static version: string = '1.0.42(August 19)';

    public static getVersion(): string {
        return VersionHelper.version;
    }

    public static getBuild(): string {
        return '1';
    }

    public static getFullVersion(): string {
        return `${VersionHelper.getVersion()}.${VersionHelper.getBuild()}`;
    }

    public static getFullVersionWithDate(): string {
        return `${VersionHelper.getFullVersion()} - ${new Date().toLocaleDateString()}`;
    }


    public static getFullVersionWithDateAndTime(): string {
        return `${VersionHelper.getFullVersion()} - ${new Date().toLocaleString()}`;
    }


    public static getFullVersionWithDateAndTimeAndSeconds(): string {
        return `${VersionHelper.getFullVersion()} - ${new Date().toLocaleString()}`;
    }

    //add version 
    public static addVersion(version: string, build: string): string {
        return `${version}.${build}`;
    }

    //update version
    public static updateVersion(version: string, build: string): string {
        return `${version}.${build}`;
    }
}