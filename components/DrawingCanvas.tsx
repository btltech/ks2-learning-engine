import React, { useRef, useState, useEffect } from 'react';

interface DrawingCanvasProps {
  onSave: (imageData: string) => void;
  width?: number;
  height?: number;
  initialImage?: string; // Optional background image to draw on
}

export const DrawingCanvas: React.FC<DrawingCanvasProps> = ({ 
  onSave, 
  width = 600, 
  height = 400,
  initialImage 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#000000');
  const [lineWidth, setLineWidth] = useState(3);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);

  // Initialize canvas context
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        setContext(ctx);

        // Set white background initially
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        if (initialImage) {
          const img = new Image();
          img.src = initialImage;
          img.onload = () => {
            ctx.drawImage(img, 0, 0, width, height);
          };
        }
      }
    }
  }, [width, height, initialImage]);

  // Update context properties when state changes
  useEffect(() => {
    if (context) {
      context.strokeStyle = color;
      context.lineWidth = lineWidth;
    }
  }, [color, lineWidth, context]);

  const startDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!context || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    context.beginPath();
    context.moveTo(x, y);
    setIsDrawing(true);
    
    // Capture pointer to ensure we track movement even if it leaves the canvas
    canvas.setPointerCapture(e.pointerId);
  };

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !context || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    context.lineTo(x, y);
    context.stroke();
  };

  const stopDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !context) return;
    
    context.closePath();
    setIsDrawing(false);
    
    if (canvasRef.current) {
      canvasRef.current.releasePointerCapture(e.pointerId);
    }
  };

  const clearCanvas = () => {
    if (!context || !canvasRef.current) return;
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    
    // Re-draw initial image if it exists
    if (initialImage) {
      const img = new Image();
      img.src = initialImage;
      img.onload = () => {
        context.drawImage(img, 0, 0, width, height);
      };
    }
  };

  const handleSave = () => {
    if (canvasRef.current) {
      const dataUrl = canvasRef.current.toDataURL('image/png');
      onSave(dataUrl);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4 bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="flex flex-wrap gap-4 items-center justify-center w-full mb-2">
        {/* Color Picker */}
        <div className="flex gap-2">
          {['#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FFA500', '#800080'].map((c) => (
            <button
              key={c}
              className={`w-8 h-8 rounded-full border-2 ${color === c ? 'border-gray-600 scale-110' : 'border-transparent'}`}
              style={{ backgroundColor: c }}
              onClick={() => setColor(c)}
              aria-label={`Select color ${c}`}
            />
          ))}
          <input 
            type="color" 
            value={color} 
            onChange={(e) => setColor(e.target.value)}
            className="w-8 h-8 rounded-full overflow-hidden cursor-pointer"
          />
        </div>

        {/* Line Width */}
        <div className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-lg">
          <span className="text-xs font-medium text-gray-600">Size:</span>
          <input
            type="range"
            min="1"
            max="20"
            value={lineWidth}
            onChange={(e) => setLineWidth(parseInt(e.target.value))}
            className="w-24"
          />
        </div>

        {/* Actions */}
        <button
          onClick={clearCanvas}
          className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
        >
          Clear
        </button>
      </div>

      <div className="relative border-2 border-dashed border-gray-300 rounded-lg overflow-hidden touch-none">
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          onPointerDown={startDrawing}
          onPointerMove={draw}
          onPointerUp={stopDrawing}
          onPointerLeave={stopDrawing}
          className="cursor-crosshair touch-none"
          style={{ maxWidth: '100%', height: 'auto' }}
        />
      </div>

      <button
        onClick={handleSave}
        className="w-full py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition-colors shadow-md"
      >
        Submit Drawing
      </button>
    </div>
  );
};
