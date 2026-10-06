// export.js - create .xlsx from table and inject Export button (with styling)
(function(){
    function tableToAoA(table){
        var aoa = [];
        var rows = table.querySelectorAll('tr');
        rows.forEach(function(tr){
            var cells = tr.querySelectorAll('th,td');
            if (!cells || cells.length === 0) return;
            var row = [];
            // exclude last column (assumed Actions)
            var limit = Math.max(0, cells.length - 1);
            for (var i = 0; i < limit; i++) {
                row.push(cells[i].innerText.trim());
            }
            aoa.push(row);
        });
        return aoa;
    }

    function exportTableToXLSX(table, filename) {
        if (!window.XLSX) {
            alert('Biblioteca XLSX não carregada.');
            return;
        }

        var aoa = tableToAoA(table);
        if (!aoa || aoa.length === 0) {
            alert('Tabela vazia.');
            return;
        }

        var ws = XLSX.utils.aoa_to_sheet(aoa);

        // Styling: header (row 0) - blue background, white bold text, thin borders, center
        var headerCols = aoa[0].length;
        for (var c = 0; c < headerCols; c++) {
            var cellAddress = XLSX.utils.encode_cell({r:0, c:c});
            var cell = ws[cellAddress];
            if (!cell) continue;
            cell.s = cell.s || {};
            cell.s.font = {bold:true, color:{rgb:"FFFFFF"}};
            cell.s.fill = {fgColor:{rgb:"003E7E"}};
            cell.s.alignment = {horizontal:"center", vertical:"center"};
            cell.s.border = {
                top: {style:"thin", color:{rgb:"000000"}},
                bottom: {style:"thin", color:{rgb:"000000"}},
                left: {style:"thin", color:{rgb:"000000"}},
                right: {style:"thin", color:{rgb:"000000"}}
            };
        }

        // Apply alternating row fill and borders for data rows
        for (var r = 1; r < aoa.length; r++) {
            for (var c = 0; c < headerCols; c++) {
                var addr = XLSX.utils.encode_cell({r:r, c:c});
                var cell = ws[addr];
                if (!cell) continue;
                cell.s = cell.s || {};
                // alternate light fill
                if (r % 2 === 0) {
                    cell.s.fill = {fgColor:{rgb:"F7FAFF"}};
                }
                cell.s.alignment = {vertical:"center"};
                cell.s.border = {
                    top: {style:"thin", color:{rgb:"e6e6e6"}},
                    bottom: {style:"thin", color:{rgb:"e6e6e6"}},
                    left: {style:"thin", color:{rgb:"e6e6e6"}},
                    right: {style:"thin", color:{rgb:"e6e6e6"}}
                };
            }
        }

        // Set reasonable column widths
        ws['!cols'] = aoa[0].map(function(){ return {wch:30}; });

        var wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Pendências');

        var fname = filename || ('pendencias_' + (new Date()).toISOString().split('T')[0] + '.xlsx');
        // Ask SheetJS to include styles (may require full build)
        try {
            XLSX.writeFile(wb, fname, {bookType:'xlsx', cellStyles:true});
        } catch (e) {
            // fallback if cellStyles not supported
            XLSX.writeFile(wb, fname);
        }
    }

    function ensureTableAndButton(){
        var table = document.getElementById('tablePendenciasRS1');
        if (!table) table = document.querySelector('.card table');
        if (!table) return;

        // ensure table has id
        if (!table.id) table.id = 'tablePendenciasRS1';

        // find header and inject button if missing
        var h2 = document.querySelector('.card h2');
        if (!h2) return;
        if (!document.getElementById('btnExportExcel')) {
            var btn = document.createElement('button');
            btn.id = 'btnExportExcel';
            btn.className = 'btn-export';
            btn.type = 'button';
            btn.innerText = 'Exportar para Excel';
            btn.style.marginLeft = '10px';
            h2.appendChild(btn);
            btn.addEventListener('click', function(){
                exportTableToXLSX(table, 'Pendencias_RS1_' + (new Date()).toISOString().split('T')[0] + '.xlsx');
            });
        }
    }

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        setTimeout(ensureTableAndButton, 50);
    } else {
        document.addEventListener('DOMContentLoaded', ensureTableAndButton);
    }
})();