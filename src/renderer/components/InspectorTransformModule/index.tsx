import { faArrowsUpDownLeftRight } from "@fortawesome/free-solid-svg-icons"
import InspectorModule from "../InspectorModule"
import TextInputField from "../TextInputField";
import './inspector-transform-module.scss';
import { useContext, useEffect } from "react";
import { InspectorContext } from "../Inspector";
import { useComponentForceRerender } from "renderer/middleware/hooks/useComponentForceRerender";

const InspectorTransformModule = () => {
  const {
    entity,
  } = useContext(InspectorContext);

  const forceRerender = useComponentForceRerender()
  useEffect(() => {
    const interval = setInterval(() => {
      forceRerender()
    }, 100);
    return () => clearInterval(interval)
  }, [])

  return (
    <InspectorModule name='Transform' icon={faArrowsUpDownLeftRight} className="transform-module">
      <span className="key">Position</span>

      <div className='data'>
        <TextInputField inputPrefix="X:" value={entity.transform.position.x} idleValue={entity.transform.position.x.toFixed(2)} fieldClassName="r" />
        <TextInputField inputPrefix="Y:" value={entity.transform.position.y} idleValue={entity.transform.position.y.toFixed(2)} fieldClassName="l" />
      </div>
      <span className="key">Scale</span>
      <div className='data'>
        <TextInputField inputPrefix="X:" value={entity.transform.scale.x} idleValue={entity.transform.scale.x.toFixed(2)} fieldClassName="r" />
        <TextInputField inputPrefix="Y:" value={entity.transform.scale.y} idleValue={entity.transform.scale.y.toFixed(2)} fieldClassName="l" />
      </div>
      <span className="key">Rotation</span>
      <div className='data'>
        <TextInputField inputPrefix="Radians:" value={entity.transform.rotation} idleValue={entity.transform.rotation.toFixed(2)} />
      </div>
    </InspectorModule>
  );
}

export default InspectorTransformModule;