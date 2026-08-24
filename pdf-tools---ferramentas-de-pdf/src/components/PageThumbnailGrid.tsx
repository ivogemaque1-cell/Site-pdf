import React, { useState } from 'react';
import { RotateCw, RotateCcw, Trash2, Check, ZoomIn, X, Eye } from 'lucide-react';
import { PDFPageInfo } from '../types';

interface PageThumbnailGridProps {
  pages: PDFPageInfo[];
  mode: 'select' | 'remove' | 'rotate' | 'view';
  onToggleSelect?: (pageNumber: number) => void;
  onToggleRemove?: (pageNumber: number) => void;
  onRotatePage?: (pageNumber: number, direction: 'cw' | 'ccw') => void;
  onSelectAll?: () => void;
  onClearAll?: () => void;
  onRotateAll?: (direction: 'cw' | 'ccw') => void;
}

export const PageThumbnailGrid: React.FC<PageThumbnailGridProps> = ({
  pages,
  mode,
  onToggleSelect,
  onToggleRemove,
  onRotatePage,
  onSelectAll,
  onClearAll,
  onRotateAll,
}) => {
  const [zoomModalPage, setZoomModalPage] = useState<PDFPageInfo | null>(null);

  const selectedCount = pages.filter((p) => p.selected).length;
  const removedCount = pages.filter((p) => p.markedForRemoval).length;

  return (
    <div className="space-y-4">
      {/* Top Toolbar for Bulk Actions */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3.5 bg-[#EEF1EB] border border-[#E2E6DE] rounded-xl text-xs sm:text-sm">
        <div className="flex items-center space-x-2 font-medium text-[#2D3436]">
          <span>Total: {pages.length} páginas</span>
          {mode === 'remove' && (
            <span className="text-[#B34A3E] font-semibold">({removedCount} marcadas para remoção)</span>
          )}
          {mode === 'select' && (
            <span className="text-[#2D5A43] font-semibold">({selectedCount} selecionadas)</span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {mode === 'select' && onSelectAll && onClearAll && (
            <>
              <button
                type="button"
                onClick={onSelectAll}
                className="px-3 py-1 bg-white hover:bg-[#E2E6DE] border border-[#D5D8D0] rounded-lg text-[#2D3436] font-medium transition cursor-pointer shadow-2xs"
              >
                Selecionar Todas
              </button>
              <button
                type="button"
                onClick={onClearAll}
                className="px-3 py-1 bg-white hover:bg-[#E2E6DE] border border-[#D5D8D0] rounded-lg text-[#2D3436] font-medium transition cursor-pointer shadow-2xs"
              >
                Desmarcar
              </button>
            </>
          )}

          {mode === 'remove' && onClearAll && (
            <>
              <button
                type="button"
                onClick={onSelectAll}
                className="px-3 py-1 bg-white hover:bg-[#E2E6DE] border border-[#D5D8D0] rounded-lg text-[#2D3436] font-medium transition cursor-pointer shadow-2xs"
              >
                Marcar Todas
              </button>
              <button
                type="button"
                onClick={onClearAll}
                className="px-3 py-1 bg-white hover:bg-[#E2E6DE] border border-[#D5D8D0] rounded-lg text-[#2D3436] font-medium transition cursor-pointer shadow-2xs"
              >
                Desmarcar Todas
              </button>
            </>
          )}

          {mode === 'rotate' && onRotateAll && (
            <>
              <button
                type="button"
                onClick={() => onRotateAll('ccw')}
                className="inline-flex items-center space-x-1 px-3 py-1 bg-white hover:bg-[#E2E6DE] border border-[#D5D8D0] rounded-lg text-[#2D3436] font-medium transition cursor-pointer shadow-2xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Girar Todas -90°</span>
              </button>
              <button
                type="button"
                onClick={() => onRotateAll('cw')}
                className="inline-flex items-center space-x-1 px-3 py-1 bg-white hover:bg-[#E2E6DE] border border-[#D5D8D0] rounded-lg text-[#2D3436] font-medium transition cursor-pointer shadow-2xs"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Girar Todas +90°</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Pages Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {pages.map((page) => {
          const isMarkedRemove = page.markedForRemoval;
          const isSelected = page.selected;

          return (
            <div
              key={page.pageNumber}
              className={`group relative bg-white rounded-xl border transition-all duration-200 overflow-hidden shadow-2xs ${
                mode === 'remove' && isMarkedRemove
                  ? 'border-[#B34A3E] ring-2 ring-[#B34A3E]/40 bg-[#FDF2F0]/50 opacity-80'
                  : mode === 'select' && isSelected
                  ? 'border-[#2D5A43] ring-2 ring-[#2D5A43]/40 bg-[#EAF1EC]/40'
                  : 'border-[#E2E6DE] hover:border-[#CBD2C8] hover:shadow'
              }`}
            >
              {/* Top status & page number header */}
              <div className="flex items-center justify-between px-2.5 py-1.5 bg-[#F5F7F3] border-b border-[#E8EBE4] text-xs">
                <span className="font-semibold text-[#2D3436]">Pág. {page.pageNumber}</span>

                {/* Quick preview zoom button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setZoomModalPage(page);
                  }}
                  className="p-1 text-[#8C9A9E] hover:text-[#2D3436] hover:bg-[#E2E6DE] rounded transition cursor-pointer"
                  title="Ampliar visualização"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Clickable thumbnail area */}
              <div
                onClick={() => {
                  if (mode === 'remove' && onToggleRemove) {
                    onToggleRemove(page.pageNumber);
                  } else if (mode === 'select' && onToggleSelect) {
                    onToggleSelect(page.pageNumber);
                  }
                }}
                className={`relative aspect-[3/4] p-2 flex items-center justify-center bg-[#F2F4EF]/60 cursor-pointer select-none`}
              >
                {page.thumbnailUrl ? (
                  <div
                    className="w-full h-full flex items-center justify-center transition-transform duration-200"
                    style={{
                      transform: `rotate(${page.rotation}deg)`,
                    }}
                  >
                    <img
                      src={page.thumbnailUrl}
                      alt={`Página ${page.pageNumber}`}
                      className="max-w-full max-h-full object-contain rounded shadow-2xs"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#8C9A9E] text-xs bg-[#EAECE6] rounded">
                    Carregando...
                  </div>
                )}

                {/* Overlay Badge for Removal Mode */}
                {mode === 'remove' && isMarkedRemove && (
                  <div className="absolute inset-0 bg-[#B34A3E]/30 backdrop-blur-[1px] flex flex-col items-center justify-center text-white">
                    <div className="w-8 h-8 rounded-full bg-[#B34A3E] flex items-center justify-center shadow">
                      <Trash2 className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold mt-1 bg-[#B34A3E]/95 px-2 py-0.5 rounded">Remover</span>
                  </div>
                )}

                {/* Overlay Badge for Select Mode */}
                {mode === 'select' && (
                  <div
                    className={`absolute top-2 right-2 w-5 h-5 rounded-md flex items-center justify-center border transition ${
                      isSelected
                        ? 'bg-[#2D5A43] border-[#2D5A43] text-white'
                        : 'bg-white/90 border-[#CBD2C8] text-transparent group-hover:text-[#CBD2C8]'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                )}
              </div>

              {/* Bottom Actions for Rotation Mode */}
              {mode === 'rotate' && onRotatePage && (
                <div className="p-1.5 bg-[#F5F7F3] border-t border-[#E8EBE4] flex items-center justify-center space-x-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRotatePage(page.pageNumber, 'ccw');
                    }}
                    className="p-1.5 text-[#4A5558] hover:text-[#2D3436] hover:bg-[#E2E6DE] rounded transition cursor-pointer"
                    title="Girar 90° para a esquerda"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                  <span className="text-[11px] font-mono text-[#636E72]">{page.rotation}°</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRotatePage(page.pageNumber, 'cw');
                    }}
                    className="p-1.5 text-[#4A5558] hover:text-[#2D3436] hover:bg-[#E2E6DE] rounded transition cursor-pointer"
                    title="Girar 90° para a direita"
                  >
                    <RotateCw className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal Zoom Preview */}
      {zoomModalPage && (
        <div
          className="fixed inset-0 z-50 bg-[#1E2B24]/75 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setZoomModalPage(null)}
        >
          <div
            className="bg-[#FDFDFD] rounded-2xl p-4 max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl relative border border-[#E2E6DE]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E6DE]">
              <h3 className="font-semibold text-[#2D3436] text-sm">
                Visualização: Página {zoomModalPage.pageNumber}
              </h3>
              <button
                onClick={() => setZoomModalPage(null)}
                className="p-1 rounded-lg text-[#8C9A9E] hover:text-[#2D3436] hover:bg-[#EEF1EB] transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-[#F2F4EF]/70 rounded-xl my-2">
              {zoomModalPage.thumbnailUrl && (
                <img
                  src={zoomModalPage.thumbnailUrl}
                  alt={`Página ${zoomModalPage.pageNumber}`}
                  className="max-w-full max-h-[70vh] object-contain rounded shadow"
                  style={{
                    transform: `rotate(${zoomModalPage.rotation}deg)`,
                  }}
                  referrerPolicy="no-referrer"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
