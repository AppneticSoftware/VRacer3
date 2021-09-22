///////////////////////////////////////////////////////////////////////////////
// Helper Function - Create DOM Elements
//
//
// Author: Andreas Roessler
// Changed: 01.05.2021
//
///////////////////////////////////////////////////////////////////////////////

/*
    Parameters: 
    1. DOM Tag
    2. DOM Attributes
    3. ADDITIONAL arguments are treated as text node OR as children

*/

export function dom(tag, attributes) {
  let node = document.createElement(tag);
  if (attributes) {
    for (let att in attributes) {
      node.setAttribute(att, attributes[att]);
    }
  }
  for (let i = 2; i < arguments.length; ++i) {
    let child = arguments[i];
    if (typeof child == "string") {
      child = document.createTextNode(child);
    }
    try {
      node.appendChild(child);
    } catch (e) {
      console.log("Error in dom with " + child + ": " + e);
    }
  }
  return node;
}

export function removeChildren(node) {
  while (node.firstChild) {
    node.removeChild(node.firstChild);
  }
}
