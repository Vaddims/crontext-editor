import { Renderer, SimulationInspectorRenderer, Vector } from "crontext";
import { Fragment, useEffect, useRef, useState } from "react";
import { newEntityContextMenuPrebuild } from "renderer/services/context-menu/prebuilds/new-entity.cmp";

interface Props {
  renderer: Renderer;
  className?: string;
  onMount?: (element: HTMLDivElement) => void;
  bigpicture?: boolean;
  children?: React.ReactNode;
}

const RendererDisplayer: React.FC<Props> = (props) => {
  const { renderer } = props;
  const wrapperRef = useRef<HTMLDivElement>(null);
  const decoyRef = useRef<HTMLDivElement>(null);
  const [ useBigpicture, setBigpicture ] = useState(props.bigpicture);
 
  useEffect(() => {
    wrapperRef.current?.append(renderer.canvas);

    const handleContextMenu = async (event: MouseEvent) => {
      if (!(renderer instanceof SimulationInspectorRenderer)) {
        return;
      }
      
      event.preventDefault();
      renderer.mouseDown = false;

      const entityCreationMenu = newEntityContextMenuPrebuild(renderer, renderer.inspector.optic, new Vector(event.offsetX, event.offsetY));
      const response = await window.electron.ipcRenderer.openContextMenu([
        {
          label: 'Create Entity',
          submenu: entityCreationMenu.template,
        }
      ]);

      entityCreationMenu.handle(response);
    }

    renderer.canvas.addEventListener('contextmenu', handleContextMenu);

    return () => {
      wrapperRef.current?.removeChild(renderer.canvas);
      renderer.canvas.removeEventListener('contextmenu', handleContextMenu);
    }
  }, [wrapperRef.current, renderer.canvas]);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) {
      return;
    } 

    const handleWrapperResize = () => {
      renderer.resize(new Vector(wrapper.clientWidth, wrapper.clientHeight));
    }

    const observer = new ResizeObserver(handleWrapperResize);
    observer.observe(wrapper);

    props?.onMount?.(wrapper);

    return () => {
      observer.disconnect();
    }
  }, [wrapperRef.current]);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const decoy = decoyRef.current;
    if (!wrapper || !decoy) {
      return;
    }

    if (props.bigpicture) {
      if (useBigpicture) {
        return;
      }

      wrapper.style.left = decoy.offsetLeft + 'px';
      wrapper.style.width = decoy.clientWidth.toString() + 'px';
      wrapper.style.height = decoy.clientHeight.toString() + 'px';

      setTimeout(() => {
        wrapper.setAttribute('data-bigpicture', 'true');
        wrapper.setAttribute('data-bigpicture-lock', 'true');
        
      })

      setBigpicture(true);
    } else {
      if (!useBigpicture) {
        return;
      }

      wrapper.setAttribute('data-bigpicture-lock', 'false');

      wrapper.style.left = decoy.offsetLeft + 'px';
      wrapper.style.width = decoy.clientWidth.toString() + 'px';
      wrapper.style.height = decoy.clientHeight.toString() + 'px';

      setTimeout(() => {
        wrapper.setAttribute('data-bigpicture', 'false');
        wrapper.removeAttribute('style')
      }, 500);

      setBigpicture(false);
    }
  }, [props.bigpicture]);
  
  return (
    <Fragment>
      <div ref={decoyRef} className='renderer-size-decoy' />
      <div ref={wrapperRef} className={['renderer-displayer', props.className].join(' ')}>
        {props.children}
      </div>
    </Fragment>
  )
}

export default RendererDisplayer;