import { Injectable } from '@nestjs/common';
const docx = require("docx");
const { Document, Packer, Paragraph, TextRun, saveAs } = docx;

@Injectable()
export class DocService {
  async generateDocument(): Promise<Buffer> {
    // Usa import dinámico para cargar la librería docx solo cuando sea necesario

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

    const buffer = await Packer.toBuffer(doc);
    return buffer;
  }
}
