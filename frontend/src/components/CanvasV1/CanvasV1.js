import {
  useEffect,
  useCallback,
  useLayoutEffect,
  useRef,
  useState
} from "react";
import * as React from "react";
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import CanvasModal from './CanvasModalV1'

const canvasWidth = 500;
const canvasHeight = 500;
const ratio = 2;

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '500px',
  height: '500px',
  bgcolor: 'background.paper',
  boxShadow: 24,
};

export default function Canvas() {
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const [context, setContext] = useState(null);
  const [scale, setScale] = useState(1);
  const [open, setOpen] = React.useState(false);
  const [imgLoad, setImgLoad] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  // reset
  const reset = useCallback(
    (context) => {
      if (context) {
        // adjust for device pixel density
        context.canvas.width = canvasWidth * ratio;
        context.canvas.height = canvasHeight * ratio;
        context.scale(ratio, ratio);
        setScale(ratio);
        setContext(context);
      }
    },
    [canvasWidth, canvasHeight]
  );

  useLayoutEffect(() => {
    if (canvasRef.current) {
      // get new drawing context
      const renderCtx = canvasRef.current.getContext("2d");

      if (renderCtx) {
        reset(renderCtx);
      }
    }
  }, [reset, canvasHeight, canvasWidth]);

  // draw
  useLayoutEffect(() => {
    if (context) {
      const squareSize = canvasWidth;

      // const storedTransform = context.getTransform();
      // context.setTransform(storedTransform);
      if (imgLoad) {
        context.drawImage(imageRef.current, 0, 0, imageRef.current.width, imageRef.current.height, 0, 0, canvasWidth, canvasHeight)
      }
    }
  }, [
    context,
    canvasWidth,
    canvasHeight,
    scale,
    imgLoad
  ]);

  return (
    <div>
      <canvas
        onClick={handleOpen}
        ref={canvasRef}
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
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <CanvasModal />
        </Box>
      </Modal>
    </div>
  );
}
