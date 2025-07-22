// controllers/exportController.js
const { Producto } = require('../models'); // Импорт модели товара
const { Parser } = require('json2csv'); // Для генерации CSV
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');

// CSV
exports.exportarCSV = async (req, res) => {
  console.log('🚀 exportarCSV llamado');
  try {
    const productos = await Producto.findAll(); // ✅

    if (!productos || productos.length === 0) {
      return res.status(404).send('No hay productos para exportar.');
    }
    console.log('exportarCSV: Export success');

    const fields = ['id', 'nombre', 'descripcion', 'precioUnitario', 'stock', 'imagenUrl'];
    const parser = new Parser({ fields });
    const csv = parser.parse(productos.map(p => p.toJSON())); // ✅ Sequelize instance → plain object

    res.header('Content-Type', 'text/csv');
    res.attachment('productos.csv');
    return res.send(csv);
  } catch (err) {
    console.error('Error al exportar CSV:', err);
    res.status(500).send('Error al generar CSV.');
  }
};

// PDF
exports.exportarPDF = async (req, res) => {
  try {
    const productos = await Producto.findAll();

    if (!productos || productos.length === 0) {
      return res.status(404).send('No hay productos para exportar.');
    }

    const doc = new PDFDocument({ margin: 30, size: 'A4' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=productos.pdf');

    doc.pipe(res);

    doc.fontSize(18).text('Lista de Productos', { align: 'center' });
    doc.moveDown();

    productos.forEach(producto => {
      doc.fontSize(12).text(`ID: ${producto.id}`);
      doc.text(`Nombre: ${producto.nombre}`);
      doc.text(`Descripción: ${producto.descripcion || '-'}`);
      doc.text(`Precio Unitario: €${parseFloat(producto.precioUnitario || 0).toFixed(2)}`);
      doc.text(`Stock: ${producto.stock}`);
      doc.text(`Imagen URL: ${producto.imagenUrl || '-'}`);
      doc.moveDown();
    });

    doc.end();

  } catch (err) {
    console.error('Error al exportar PDF:', err);
    res.status(500).send('Error al generar PDF.');
  }
};

// Excel
exports.exportarExcel = async (req, res) => {
  try {
    const productos = await Producto.findAll();

    if (!productos || productos.length === 0) {
      return res.status(404).send('No hay productos para exportar.');
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Productos');

    worksheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Nombre', key: 'nombre', width: 30 },
      { header: 'Descripción', key: 'descripcion', width: 30 },
      { header: 'Precio Unitario', key: 'precioUnitario', width: 15 },
      { header: 'Stock', key: 'stock', width: 10 },
      { header: 'Imagen URL', key: 'imagenUrl', width: 40 }
    ];

    productos.forEach(p => {
      worksheet.addRow({
        id: p.id,
        nombre: p.nombre,
        descripcion: p.descripcion,
        precioUnitario: p.precioUnitario,
        stock: p.stock,
        imagenUrl: p.imagenUrl
      });
    });

    worksheet.getRow(1).font = { bold: true };

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=productos.xlsx'
    );

    await workbook.xlsx.write(res);
    res.end();

  } catch (err) {
    console.error('Error al exportar Excel:', err);
    res.status(500).send('Error al generar Excel.');
  }
};

// === 👥 CLIENTES ===
exports.exportarClientesCSV = async (req, res) => {
  try {
    const clientes = await Cliente.findAll();
    if (!clientes.length) return res.status(404).send('No hay clientes para exportar.');

    const fields = ['id', 'nombre', 'email', 'rol'];
    const parser = new Parser({ fields });
    const csv = parser.parse(clientes.map(c => c.toJSON()));

    res.header('Content-Type', 'text/csv');
    res.attachment('clientes.csv');
    return res.send(csv);
  } catch (err) {
    console.error('Error al exportar CSV de clientes:', err);
    res.status(500).send('Error al generar CSV.');
  }
};

exports.exportarClientesPDF = async (req, res) => {
  try {
    const clientes = await Cliente.findAll();
    if (!clientes.length) return res.status(404).send('No hay clientes.');

    const doc = new PDFDocument({ margin: 30, size: 'A4' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=clientes.pdf');
    doc.pipe(res);

    doc.fontSize(18).text('Lista de Clientes', { align: 'center' }).moveDown();
    clientes.forEach(c => {
      doc.fontSize(12).text(`ID: ${c.id}`);
      doc.text(`Nombre: ${c.nombre}`);
      doc.text(`Email: ${c.email}`);
      doc.text(`Rol: ${c.rol}`);
      doc.moveDown();
    });

    doc.end();
  } catch (err) {
    console.error('Error al exportar PDF de clientes:', err);
    res.status(500).send('Error al generar PDF.');
  }
};

exports.exportarClientesExcel = async (req, res) => {
  try {
    const clientes = await Cliente.findAll();
    if (!clientes.length) return res.status(404).send('No hay clientes.');

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Clientes');

    sheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Nombre', key: 'nombre', width: 30 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Rol', key: 'rol', width: 15 }
    ];

    clientes.forEach(c => sheet.addRow(c.toJSON()));
    sheet.getRow(1).font = { bold: true };

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=clientes.xlsx');
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error('Error al exportar Excel de clientes:', err);
    res.status(500).send('Error al generar Excel.');
  }
};

// === 📦 PEDIDOS ===
exports.exportarPedidosCSV = async (req, res) => {
  try {
    const pedidos = await Pedido.findAll({ include: 'Cliente' });
    if (!pedidos.length) return res.status(404).send('No hay pedidos.');

    const data = pedidos.map(p => ({
      id: p.id,
      cliente: p.Cliente ? p.Cliente.nombre : '',
      fecha: p.createdAt,
      pagado: p.pagado ? 'Sí' : 'No',
      estadoTrabajo: p.estadoTrabajo
    }));

    const fields = ['id', 'cliente', 'fecha', 'pagado', 'estadoTrabajo'];
    const parser = new Parser({ fields });
    const csv = parser.parse(data);

    res.header('Content-Type', 'text/csv');
    res.attachment('pedidos.csv');
    return res.send(csv);
  } catch (err) {
    console.error('Error al exportar CSV de pedidos:', err);
    res.status(500).send('Error al generar CSV.');
  }
};

exports.exportarPedidosPDF = async (req, res) => {
  try {
    const pedidos = await Pedido.findAll({ include: 'Cliente' });
    if (!pedidos.length) return res.status(404).send('No hay pedidos.');

    const doc = new PDFDocument({ margin: 30, size: 'A4' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=pedidos.pdf');
    doc.pipe(res);

    doc.fontSize(18).text('Lista de Pedidos', { align: 'center' }).moveDown();
    pedidos.forEach(p => {
      doc.fontSize(12).text(`ID: ${p.id}`);
      doc.text(`Cliente: ${p.Cliente ? p.Cliente.nombre : '-'}`);
      doc.text(`Fecha: ${p.createdAt.toLocaleString()}`);
      doc.text(`Pagado: ${p.pagado ? 'Sí' : 'No'}`);
      doc.text(`Estado: ${p.estadoTrabajo}`);
      doc.moveDown();
    });

    doc.end();
  } catch (err) {
    console.error('Error al exportar PDF de pedidos:', err);
    res.status(500).send('Error al generar PDF.');
  }
};

exports.exportarPedidosExcel = async (req, res) => {
  try {
    const pedidos = await Pedido.findAll({ include: 'Cliente' });
    if (!pedidos.length) return res.status(404).send('No hay pedidos.');

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Pedidos');

    sheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Cliente', key: 'cliente', width: 30 },
      { header: 'Fecha', key: 'fecha', width: 25 },
      { header: 'Pagado', key: 'pagado', width: 10 },
      { header: 'Estado del trabajo', key: 'estadoTrabajo', width: 25 }
    ];

    pedidos.forEach(p => {
      sheet.addRow({
        id: p.id,
        cliente: p.Cliente ? p.Cliente.nombre : '',
        fecha: p.createdAt.toLocaleString(),
        pagado: p.pagado ? 'Sí' : 'No',
        estadoTrabajo: p.estadoTrabajo
      });
    });

    sheet.getRow(1).font = { bold: true };

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=pedidos.xlsx');
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error('Error al exportar Excel de pedidos:', err);
    res.status(500).send('Error al generar Excel.');
  }
};

console.log('exportController:', {
  exportarCSV: exports.exportarCSV,
  exportarPDF: exports.exportarPDF,
  exportarExcel: exports.exportarExcel
});