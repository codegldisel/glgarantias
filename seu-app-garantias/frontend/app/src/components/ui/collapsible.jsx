import * as CollapsiblePrimitive from "@radix-ui/react-collapsible"
import PropTypes from 'prop-types'

function Collapsible({
  ...props
}) {
  return <CollapsiblePrimitive.Root data-slot="collapsible" {...props} />;
}

function CollapsibleTrigger({
  ...props
}) {
  return (<CollapsiblePrimitive.CollapsibleTrigger data-slot="collapsible-trigger" {...props} />);
}

function CollapsibleContent({
  ...props
}) {
  return (<CollapsiblePrimitive.CollapsibleContent data-slot="collapsible-content" {...props} />);
}

Collapsible.propTypes = {}
CollapsibleTrigger.propTypes = {}
CollapsibleContent.propTypes = {}

export { Collapsible, CollapsibleTrigger, CollapsibleContent }
