//create class for LocalFileHelper using cordova file plugin

class LocalFileHelper {

    //init file system
    private static fileSystem: any;

    public static initFileSystem(): void {
        window.requestFileSystem(
          LocalFileSystem.PERSISTENT,
          0,
          (fs: FileSystem) => {
            this.fileSystem = fs;
            console.log('FileSystem initialized:', fs.name);
          },
          (error: FileError) => {
            console.error('Failed to initialize FileSystem:', error);
          }
        );
      }

  //create test local file in root directory
    public static createTestFile(): void {
        if (!this.fileSystem) {
        this.initFileSystem();
        }
    
        this.fileSystem.root.getFile(
        'test.txt',
        { create: true, exclusive: true },
        (fileEntry: FileEntry) => {
            console.log('File created:', fileEntry.name);
        },
        (error: FileError) => {
            console.error('Failed to create file:', error);
        }
        );
    }

    //find all files names in root directory
    public static listFiles(): string[] {
        let files: string[] = [];
        if (!this.fileSystem) {
        this.initFileSystem();
        }
    
        const directoryReader = this.fileSystem.root.createReader();
        directoryReader.readEntries(
        (entries: Entry[]) => {
            console.log('Files found:', entries.map(entry => entry.name));
            files = entries.map(entry => entry.name);
        },
        (error: FileError) => {
            console.error('Failed to list files:', error);
            files = [];
        }
        );
        return files;
    }
    
}

export default LocalFileHelper;
