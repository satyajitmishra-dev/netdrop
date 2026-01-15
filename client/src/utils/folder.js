import JSZip from 'jszip';

/**
 * Processes data transfer items (drag-and-drop) to handle folders and files.
 * If a folder is detected, it zips it.
 * If mixed files or multiple files, (optional) can zip them too.
 * @param {DataTransferItemList} items 
 * @returns {Promise<File[]>} Array of Files (zipping folders into single files)
 */
export const processDropItems = async (items) => {
    const filesToSend = [];

    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.kind !== 'file') continue;

        const entry = item.webkitGetAsEntry ? item.webkitGetAsEntry() : null;

        if (entry) {
            if (entry.isDirectory) {
                // It's a folder: Zip it
                const zipBlob = await zipDirectory(entry);
                filesToSend.push(new File([zipBlob], `${entry.name}.zip`, { type: 'application/zip' }));
            } else {
                // Standard file
                const file = item.getAsFile();
                if (file) filesToSend.push(file);
            }
        } else {
            // Fallback for non-standard browsers
            const file = item.getAsFile();
            if (file) filesToSend.push(file);
        }
    }
    return filesToSend;
};

const zipDirectory = async (directoryEntry) => {
    const zip = new JSZip();
    await traverseFileTree(directoryEntry, zip);
    return await zip.generateAsync({ type: 'blob' });
};

const traverseFileTree = async (item, zipFolder) => {
    if (item.isFile) {
        return new Promise((resolve) => {
            item.file((file) => {
                zipFolder.file(item.name, file);
                resolve();
            });
        });
    } else if (item.isDirectory) {
        const dirReader = item.createReader();
        const newZipFolder = zipFolder.folder(item.name);

        return new Promise((resolve) => {
            const readEntries = async () => {
                dirReader.readEntries(async (entries) => {
                    if (entries.length === 0) {
                        resolve();
                        return;
                    }

                    const promises = entries.map(entry => traverseFileTree(entry, newZipFolder));
                    await Promise.all(promises);
                    // Continue reading (readEntries returns blocks)
                    readEntries();
                });
            };
            readEntries();
        });
    }
};

/**
 * Zips a list of File objects into a single archive.
 * @param {File[]} files 
 * @returns {Promise<File>} The zipped file
 */
export const zipFileList = async (files) => {
    const zip = new JSZip();

    files.forEach(file => {
        zip.file(file.name, file);
    });

    const blob = await zip.generateAsync({ type: 'blob' });
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    return new File([blob], `Archive_${timestamp}.zip`, { type: 'application/zip' });
};
