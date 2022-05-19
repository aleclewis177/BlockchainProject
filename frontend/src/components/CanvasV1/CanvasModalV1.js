import {
  useEffect,
  useCallback,
  useLayoutEffect,
  useRef,
  useState
} from "react";
import * as React from "react";
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';

const ORIGIN = Object.freeze({ x: 0, y: 0 });

// adjust to device to avoid blur
const { devicePixelRatio: ratio = 1 } = window;

function diffPoints(p1, p2) {
  return { x: p1.x - p2.x, y: p1.y - p2.y };
}

function addPoints(p1, p2) {
  return { x: p1.x + p2.x, y: p1.y + p2.y };
}

function scalePoint(p1, scale) {
  return { x: p1.x / scale, y: p1.y / scale };
}

const ZOOM_SENSITIVITY = 500; // bigger for lower zoom per scroll
const MAX_ZOOM = 50
const labelStyle = {
  width: '100%',
  height: '80px',
  position: 'absolute',
  top: '-40px',
  zIndex: '10',
  backgroundColor: 'lightgrey',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  borderRadius: '15px',
  textAlign: 'center',
  paddingTop: '3px'
}

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '300px',
  height: '100px',
  bgcolor: 'background.paper',
  boxShadow: 24,
};


export default function CanvasModal() {
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const [context, setContext] = useState(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState(ORIGIN);
  const [mousePos, setMousePos] = useState(ORIGIN);
  const [viewportTopLeft, setViewportTopLeft] = useState(ORIGIN);
  const isResetRef = useRef(false);
  const lastMousePosRef = useRef(ORIGIN);
  const lastOffsetRef = useRef(ORIGIN);
  const [canvasWidth, setCanvasWidth] = useState(500);
  const [canvasHeight, setCanvasHeight] = useState(500);
  const [imgLoad, setImgLoad] = React.useState(false);
  const [colorPickerModal, setColorPickerModal] = useState(false)
  const handleCloseColorPickerModal = () => setColorPickerModal(false);

  // update last offset
  useEffect(() => {
    lastOffsetRef.current = offset;
  }, [offset]);

  // reset
  const reset = useCallback(
    (context) => {
      if (context && !isResetRef.current) {
        // adjust for device pixel density
        context.canvas.width = canvasWidth * ratio;
        context.canvas.height = canvasHeight * ratio;
        context.scale(ratio, ratio);
        setScale(1);

        // reset state and refs
        setContext(context);
        setOffset(ORIGIN);
        setMousePos(ORIGIN);
        setViewportTopLeft(ORIGIN);
        lastOffsetRef.current = ORIGIN;
        lastMousePosRef.current = ORIGIN;

        // this thing is so multiple resets in a row don't clear canvas
        isResetRef.current = true;
      }
    },
    [canvasWidth, canvasHeight]
  );

  // functions for panning
  const mouseMove = useCallback(
    (event) => {
      if (context) {
        const lastMousePos = lastMousePosRef.current;
        const currentMousePos = { x: event.pageX, y: event.pageY }; // use document so can pan off element
        lastMousePosRef.current = currentMousePos;

        const mouseDiff = diffPoints(currentMousePos, lastMousePos);
        setOffset((prevOffset) => addPoints(prevOffset, mouseDiff));
      }
    },
    [context]
  );

  const mouseUp = useCallback(() => {
    document.removeEventListener("mousemove", mouseMove);
    document.removeEventListener("mouseup", mouseUp);
  }, [mouseMove]);

  const startPan = useCallback(
    (event) => {
      document.addEventListener("mousemove", mouseMove);
      document.addEventListener("mouseup", mouseUp);
      lastMousePosRef.current = { x: event.pageX, y: event.pageY };
    },
    [mouseMove, mouseUp]
  );

  // setup canvas and set context
  useLayoutEffect(() => {
    if (canvasRef.current) {
      // get new drawing context
      const renderCtx = canvasRef.current.getContext("2d");

      if (renderCtx) {
        reset(renderCtx);
      }
    }
  }, [reset, canvasHeight, canvasWidth]);

  // pan when offset or scale changes
  useLayoutEffect(() => {
    if (context && lastOffsetRef.current) {
      const offsetDiff = scalePoint(
        diffPoints(offset, lastOffsetRef.current),
        scale
      );
      context.translate(offsetDiff.x, offsetDiff.y);
      setViewportTopLeft((prevVal) => diffPoints(prevVal, offsetDiff));
      isResetRef.current = false;
    }
  }, [context, offset, scale]);

  const drawEntireCanvas = (mousePos) => {
    if (context) {
      redrawCanvas()
      drawCanvasBackground()
      // draw image
      context.drawImage(imageRef.current, 0, 0, imageRef.current.width, imageRef.current.height, 0, 0, canvasWidth, canvasHeight)
      // draw selection dot
      context.beginPath()
      context.strokeStyle = 'white'
      context.strokeWidth = '0.1'
      context.rect(viewportTopLeft.x + mousePos.x / scale, viewportTopLeft.y + mousePos.y / scale, 1, 1)
      context.stroke()
    }
  }

  const redrawCanvas = () => {
    context.clearRect(viewportTopLeft.x, viewportTopLeft.y, canvasWidth / scale + 100, canvasHeight / scale + 100);
  }

  const drawCanvasBackground = () => {
    // context.rect(viewportTopLeft.x, viewportTopLeft.y, canvasWidth / scale + 100, canvasHeight / scale + 100);
  }

  // draw
  useLayoutEffect(() => {
    if (context) {
      const squareSize = canvasWidth;

      // clear canvas but maintain transform
      const storedTransform = context.getTransform();
      context.setTransform(storedTransform);

      if (imgLoad) {
        drawEntireCanvas(mousePos)
      }
    }
  }, [
    canvasWidth,
    canvasHeight,
    context,
    scale,
    offset,
    viewportTopLeft,
    imgLoad,
    mousePos
  ]);

  // add event listener on canvas for mouse click
  useEffect(() => {
    const canvasElem = canvasRef.current;
    if (canvasElem === null) {
      return;
    }

    function handleClick(event) {
      event.preventDefault();
      if (context && canvasRef.current && scale < MAX_ZOOM) {
        const viewportMousePos = { x: event.clientX, y: event.clientY };
        const topLeftCanvasPos = {
          x: canvasRef.current.getBoundingClientRect().left,
          y: canvasRef.current.getBoundingClientRect().top
        };
        let mousePosition = diffPoints(viewportMousePos, topLeftCanvasPos)
        setMousePos(mousePosition);
        setColorPickerModal(true)
        // const zoom = MAX_ZOOM / scale;
        // const viewportTopLeftDelta = {
        //   x: (mousePosition.x / scale) * (1 - 1 / zoom),
        //   y: (mousePosition.y / scale) * (1 - 1 / zoom)
        // };
        // const newViewportTopLeft = addPoints(
        //   viewportTopLeft,
        //   viewportTopLeftDelta
        // );
        // context.translate(viewportTopLeft.x, viewportTopLeft.y);
        // context.scale(zoom, zoom);
        // context.translate(-newViewportTopLeft.x, -newViewportTopLeft.y);
        // setViewportTopLeft(newViewportTopLeft);
        // setScale(scale * zoom);
        // isResetRef.current = false;

      }
    }

    canvasElem.addEventListener("click", handleClick);
    return () => {
      canvasElem.removeEventListener("click", handleClick);
    };
  }, [context, viewportTopLeft, scale]);

  // add event listener on canvas for mouse position
  useEffect(() => {
    const canvasElem = canvasRef.current;
    if (canvasElem === null) {
      return;
    }

    function handleUpdateMouse(event) {
      event.preventDefault();
      if (canvasRef.current) {
        const viewportMousePos = { x: event.clientX, y: event.clientY };
        const topLeftCanvasPos = {
          x: canvasRef.current.getBoundingClientRect().left,
          y: canvasRef.current.getBoundingClientRect().top
        };
        let mousePosition = diffPoints(viewportMousePos, topLeftCanvasPos)
        setMousePos(mousePosition);
        drawEntireCanvas(mousePosition)
      }
    }

    canvasElem.addEventListener("mousemove", handleUpdateMouse);
    canvasElem.addEventListener("wheel", handleUpdateMouse);
    return () => {
      canvasElem.removeEventListener("mousemove", handleUpdateMouse);
      canvasElem.removeEventListener("wheel", handleUpdateMouse);
    };
  }, [context, viewportTopLeft, mousePos]);

  // add event listener on canvas for zoom
  useEffect(() => {
    const canvasElem = canvasRef.current;
    if (canvasElem === null) {
      return;
    }

    // this is tricky. Update the viewport's "origin" such that
    // the mouse doesn't move during scale - the 'zoom point' of the mouse
    // before and after zoom is relatively the same position on the viewport
    function handleWheel(event) {
      event.preventDefault();
      if (context) {
        const zoom = 1 - event.deltaY / ZOOM_SENSITIVITY;
        const viewportTopLeftDelta = {
          x: (mousePos.x / scale) * (1 - 1 / zoom),
          y: (mousePos.y / scale) * (1 - 1 / zoom)
        };
        const newViewportTopLeft = addPoints(
          viewportTopLeft,
          viewportTopLeftDelta
        );
        context.translate(viewportTopLeft.x, viewportTopLeft.y);
        context.scale(zoom, zoom);
        context.translate(-newViewportTopLeft.x, -newViewportTopLeft.y);
        setViewportTopLeft(newViewportTopLeft);
        setScale(scale * zoom);
        isResetRef.current = false;
      }
    }

    canvasElem.addEventListener("wheel", handleWheel);
    return () => canvasElem.removeEventListener("wheel", handleWheel);
  }, [context, mousePos.x, mousePos.y, viewportTopLeft, scale]);

  return (
    <div>
      <Box sx={labelStyle}>
        <button onClick={() => context && reset(context)}>Reset Preview</button>
        <pre>({Math.round(viewportTopLeft.x + mousePos.x / scale)}, {Math.round(viewportTopLeft.y + mousePos.y / scale)}) {Number.parseFloat(scale).toFixed(2)}x</pre>
      </Box>
      <canvas
        onMouseDown={startPan}
        ref={canvasRef}
        width={canvasWidth * ratio}
        height={canvasHeight * ratio}
        style={{
          border: "2px solid #000",
          width: `${canvasWidth}px`,
          height: `${canvasHeight}px`
        }}
      ></canvas>
      <img
        ref={imageRef}
        src='/static/img/sample.png'
        style={{display: 'none'}}
        onLoad={() => setImgLoad(true)}
      />
      <Modal
        open={colorPickerModal}
        onClose={handleCloseColorPickerModal}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={modalStyle}>
          <Box p={1}>
            Please Pick Color
          </Box>
        </Box>
      </Modal>
    </div>
  );
}
