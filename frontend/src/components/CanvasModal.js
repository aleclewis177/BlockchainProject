import {useRef, useState, useEffect} from 'react';
import Box from '@mui/material/Box';
import {INITIAL_VALUE, ReactSVGPanZoom, TOOL_NONE, TOOL_AUTO, zoom, fitSelection, zoomOnViewerCenter, fitToViewer, setPointOnViewerCenter} from 'react-svg-pan-zoom';
import {
  useWindowSize,
  useWindowWidth,
  useWindowHeight
} from '@react-hook/window-size'

const coordLabelStyle = {
  width: '200px',
  height: '30px',
  position: 'absolute',
  top: '20px',
  zIndex: '10',
  backgroundColor: 'lightgrey',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  borderRadius: '15px',
  textAlign: 'center',
  paddingTop: '3px'
}

export default function CanvasModal() {

  const Viewer = useRef(null);
  const [tool, setTool] = useState(TOOL_AUTO)
  const [value, setValue] = useState(INITIAL_VALUE)
  const [width, height] = useWindowSize()
  const scaleFactorMax = 50
  const scaleFactorMin = 0.2
  const [pointX, setPointX] = useState(0)
  const [pointY, setPointY] = useState(0)
  const [zoom, setZoom] = useState(0)

  useEffect(() => {
    Viewer.current.fitToViewer('center', 'center');
    // Viewer.current.zoomOnViewerCenter(0.5)
  }, []);

  const handleClick = (event) => {
    console.log('click', event.x, event.y, event.originalEvent)
    Viewer.current.setPointOnViewerCenter(event.x, event.y, scaleFactorMax)
    console.log(Viewer.current.props.scaleFactor)
  }

  const handleMouseMove = (event) => {
    setPointX(parseInt(event.x))
    setPointY(parseInt(event.y))
  }

  const handleZoom = (event) => {
    //setValue(value)
  }

  const handlePane = (event) => {
    // console.log(event.originalEvent)
  }

  /* Read all the available methods in the documentation */
  const _zoomOnViewerCenter1 = () => Viewer.current.zoomOnViewerCenter(1.1)
  const _fitSelection1 = () => Viewer.current.fitSelection(40, 40, 200, 200)
  const _fitToViewer1 = () => Viewer.current.fitToViewer()

  /* keep attention! handling the state in the following way doesn't fire onZoom and onPam hooks */
  const _zoomOnViewerCenter2 = () => setValue(zoomOnViewerCenter(value, 1.1))
  const _fitSelection2 = () => setValue(fitSelection(value, 40, 40, 200, 200))
  const _fitToViewer2 = () => setValue(fitToViewer(value))

  return (
    <div style={{width: "500px", height: "500px"}}>
      <Box sx={coordLabelStyle}>
        ({pointX}, {pointY})
      </Box>
      <ReactSVGPanZoom
        ref={Viewer}
        height={500}
        width={500}
        scaleFactorMin={scaleFactorMin}
        scaleFactorMax={scaleFactorMax}
        tool={tool}
        onChangeTool={setTool}
        value={value}
        onChangeValue={setValue}
        onZoom={event => handleZoom(event)}
        onPan={event => handlePane(event)}
        onClick={event => handleClick(event)}
        onMouseMove={event => handleMouseMove(event)}
        miniatureProps={{'position': 'none'}}
        style={{margin: '0 auto'}}
        detectWheel={true}
        detectAutoPan={false}
      >
        <svg width={1000} height={1000}>
          <g fillOpacity=".5" strokeWidth="4">
            <rect x="400" y="40" width="100" height="200" fill="#4286f4" stroke="#f4f142"/>
            <circle cx="108" cy="108.5" r="100" fill="#0ff" stroke="#0ff"/>
            <circle cx="180" cy="209.5" r="100" fill="#ff0" stroke="#ff0"/>
            <circle cx="220" cy="109.5" r="100" fill="#f0f" stroke="#f0f"/>
          </g>
        </svg>
      </ReactSVGPanZoom>
    </div>
  )
}
