import { Injectable } from '@nestjs/common';

const docx = require("docx");
const { Document, Packer, Paragraph, TextRun, saveAs } = docx;


@Injectable()
export class ReportsService {
  generate(criteria: string) {
    console.log("asdfghj")
    // Documents contain sections, you can have multiple sections per document, go here to learn more about sections
    // This simple example will only contain one section
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              children: [
                new TextRun('Hello World'),
                new TextRun({
                  text: 'Foo Bar',
                  bold: true,
                }),
                new TextRun({
                  text: '\tGithub is the best',
                  bold: true,
                }),
              ],
            }),
          ],
        },
      ],
    });

    /*Packer.toBlob(doc).then((blob: Blob) => {
      // saveAs from FileSaver will download the file
      saveAs(blob, "example.docx");
    });

    return blob*/

    // Used to export the file into a .docx file
    return Packer.toBuffer(doc)
  }
}
