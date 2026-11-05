import { Owl } from './sunny/Owl';
import { SpeechBubble } from './sunny/SpeechBubble';
import './SunnyArtAvatar.css';
import React, { useRef, useState, useEffect } from 'react';

interface DrawingCanvasProps {
  onSave: (imageData: string) => void;
  idea?: string;
  width?: number;
  height?: number;
  initialImage?: string; // Optional background image to draw on
}

export const getCanvasPoint = (
  clientX: number,
  clientY: number,
  rect: Pick<DOMRect, 'left' | 'top' | 'width' | 'height'>,
  canvasWidth: number,
  canvasHeight: number,
) => ({
  x: (clientX - rect.left) * (rect.width > 0 ? canvasWidth / rect.width : 1),
  y: (clientY - rect.top) * (rect.height > 0 ? canvasHeight / rect.height : 1),
});

export const DrawingCanvas: React.FC<DrawingCanvasProps> = ({ 
  onSave,
  idea,
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
    const { x, y } = getCanvasPoint(e.clientX, e.clientY, rect, canvas.width, canvas.height);

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
    const { x, y } = getCanvasPoint(e.clientX, e.clientY, rect, canvas.width, canvas.height);

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
    <div className="sunny-drawing sunny-ui flex flex-col items-center gap-4 p-4 bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="sunny-art-idea"><Owl pose="reading" height={90} /><SpeechBubble>Today’s idea: {idea || "Choose a colour and draw your answer."}</SpeechBubble></div>
      <div className="sunny-drawing-tools flex flex-wrap gap-4 items-center justify-center w-full mb-2">
        {/* Color Picker */}
        <div className="sunny-paint-colours"><h2>Colours</h2><div>
          {Object.entries({'#000000':'Black', '#FF0000':'Red', '#00FF00':'Green', '#0000FF':'Blue', '#FFFF00':'Yellow', '#FFA500':'Orange', '#800080':'Purple'}).map(([c,name]) => (
            <button
              key={c}
              type="button"
              className={`w-11 h-11 rounded-full border-2 ${color === c ? 'border-gray-600 scale-105' : 'border-transparent'}`}
              aria-pressed={color === c}
              onClick={() => setColor(c)}
              aria-label={`Select color ${c}`}
            ><span className="sunny-paint-blob" style={{backgroundColor:c}} aria-hidden="true" /><span>{name}</span></button>
          ))}
          <label className="sunny-custom-paint"><span>Custom</span><input
            type="color" 
            value={color} 
            onChange={(e) => setColor(e.target.value)}
            className="w-11 h-11 rounded-full overflow-hidden cursor-pointer"
            aria-label="Choose a custom drawing colour"
          /></label></div>
        </div>

        {/* Line Width */}
        <div className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-lg">
          <span className="text-xs font-medium text-gray-600">Line size:</span>
          <input
            type="range"
            min="1"
            max="20"
            value={lineWidth}
            onChange={(e) => setLineWidth(parseInt(e.target.value))}
            className="w-24"
            aria-label="Brush size"
          />
        </div>

        {/* Actions */}
        <button
          type="button"
          onClick={clearCanvas}
          className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
        >
          Clear
        </button>
      </div>

      <div className="sunny-drawing-surface relative border-2 border-dashed border-gray-300 rounded-lg overflow-hidden touch-none">
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
          aria-label="Drawing canvas"
        />
      </div>

      <button
        type="button"
        onClick={handleSave}
        className="w-full py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition-colors shadow-md"
      >
        Submit Drawing
      </button>
    </div>
  );
};
