const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const generatePDF = (
    title,
    bodyContent,
    outputPath
) => {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 50 });

        const stream = fs.createWriteStream(outputPath);
        doc.pipe(stream);

        // Header
        const headerPath = path.join(
            __dirname,
            "../header_footer/header.png"
        );
        doc.image(headerPath, 30, 20, {
            width: 530
        });

        doc.moveDown(6);

        // Title
        doc.fontSize(20)
            .text(title, {
                align: "center"
            });

        doc.moveDown(2);

        // Body
        doc.fontSize(14)
            .text(bodyContent, {
                align: "justify"
            });

        doc.moveDown(5);

        // Signature block
        doc.fontSize(12)
            .text(
                "Authorized Signature",
                {
                    align: "right"
                }
            );

        doc.moveDown(5);

        // Footer
        const footerPath = path.join(
            __dirname,
            "../header_footer/footer.png"
        );

        doc.image(
            footerPath,
            30,
            doc.page.height - 120,
            {
                width: 530
            }
        );

        doc.end();

        stream.on("finish", () => resolve(outputPath));
        stream.on("error", reject);
    });
};

module.exports = generatePDF;