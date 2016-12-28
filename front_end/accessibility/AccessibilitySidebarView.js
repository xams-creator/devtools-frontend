// Copyright 2015 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/**
 * @unrestricted
 */
Accessibility.AccessibilitySidebarView = class extends UI.ThrottledWidget {
  constructor() {
    super();
    this._node = null;
    this._axNode = null;
    this._sidebarPaneStack = UI.viewManager.createStackLocation();
    this._treeSubPane = new Accessibility.AXTreePane();
    this._sidebarPaneStack.showView(this._treeSubPane);
    this._ariaSubPane = new Accessibility.ARIAAttributesPane();
    this._sidebarPaneStack.showView(this._ariaSubPane);
    this._axNodeSubPane = new Accessibility.AXNodeSubPane();
    this._sidebarPaneStack.showView(this._axNodeSubPane);
    this._sidebarPaneStack.widget().show(this.element);
    UI.context.addFlavorChangeListener(SDK.DOMNode, this._pullNode, this);
    this._pullNode();
  }

  /**
   * @return {?SDK.DOMNode}
   */
  node() {
    return this._node;
  }

  /**
   * @param {?Accessibility.AccessibilityNode} axNode
   */
  accessibilityNodeCallback(axNode) {
    if (!axNode)
      return;

    this._axNode = axNode;

    if (axNode.ignored())
      this._sidebarPaneStack.removeView(this._ariaSubPane);
    else
      this._sidebarPaneStack.showView(this._ariaSubPane, this._axNodeSubPane);

    if (this._axNodeSubPane)
      this._axNodeSubPane.setAXNode(axNode);
    if (this._treeSubPane)
      this._treeSubPane.setAXNode(axNode);
  }

  /**
   * @override
   * @protected
   * @return {!Promise.<?>}
   */
  doUpdate() {
    var node = this.node();
    this._treeSubPane.setNode(node);
    this._axNodeSubPane.setNode(node);
    this._ariaSubPane.setNode(node);
    if (!node)
      return Promise.resolve();
    var accessibilityModel = Accessibility.AccessibilityModel.fromTarget(node.target());
    accessibilityModel.clear();
    return accessibilityModel.requestPartialAXTree(node).then(() => {
      this.accessibilityNodeCallback(accessibilityModel.axNodeForDOMNode(node));
    });
  }

  /**
   * @override
   */
  wasShown() {
    super.wasShown();

    this._treeSubPane.setNode(this.node());
    this._axNodeSubPane.setNode(this.node());
    this._ariaSubPane.setNode(this.node());

    SDK.targetManager.addModelListener(SDK.DOMModel, SDK.DOMModel.Events.AttrModified, this._onAttrChange, this);
    SDK.targetManager.addModelListener(SDK.DOMModel, SDK.DOMModel.Events.AttrRemoved, this._onAttrChange, this);
    SDK.targetManager.addModelListener(
        SDK.DOMModel, SDK.DOMModel.Events.CharacterDataModified, this._onNodeChange, this);
    SDK.targetManager.addModelListener(
        SDK.DOMModel, SDK.DOMModel.Events.ChildNodeCountUpdated, this._onNodeChange, this);
  }

  /**
   * @override
   */
  willHide() {
    SDK.targetManager.removeModelListener(SDK.DOMModel, SDK.DOMModel.Events.AttrModified, this._onAttrChange, this);
    SDK.targetManager.removeModelListener(SDK.DOMModel, SDK.DOMModel.Events.AttrRemoved, this._onAttrChange, this);
    SDK.targetManager.removeModelListener(
        SDK.DOMModel, SDK.DOMModel.Events.CharacterDataModified, this._onNodeChange, this);
    SDK.targetManager.removeModelListener(
        SDK.DOMModel, SDK.DOMModel.Events.ChildNodeCountUpdated, this._onNodeChange, this);
  }

  _pullNode() {
    this._node = UI.context.flavor(SDK.DOMNode);
    this.update();
  }

  /**
   * @param {!Common.Event} event
   */
  _onAttrChange(event) {
    if (!this.node())
      return;
    var node = event.data.node;
    if (this.node() !== node)
      return;
    this.update();
  }

  /**
   * @param {!Common.Event} event
   */
  _onNodeChange(event) {
    if (!this.node())
      return;
    var node = event.data;
    if (this.node() !== node)
      return;
    this.update();
  }
};

/**
 * @unrestricted
 */
Accessibility.AccessibilitySubPane = class extends UI.SimpleView {
  /**
   * @param {string} name
   */
  constructor(name) {
    super(name);

    this._axNode = null;
    this.registerRequiredCSS('accessibility/accessibilityNode.css');
  }

  /**
   * @param {?Accessibility.AccessibilityNode} axNode
   * @protected
   */
  setAXNode(axNode) {
  }

  /**
   * @return {?SDK.DOMNode}
   */
  node() {
    return this._node;
  }

  /**
   * @param {?SDK.DOMNode} node
   */
  setNode(node) {
    this._node = node;
  }

  /**
   * @param {string} textContent
   * @param {string=} className
   * @return {!Element}
   */
  createInfo(textContent, className) {
    var classNameOrDefault = className || 'gray-info-message';
    var info = this.element.createChild('div', classNameOrDefault);
    info.textContent = textContent;
    return info;
  }

  /**
   * @return {!UI.TreeOutline}
   */
  createTreeOutline() {
    var treeOutline = new UI.TreeOutlineInShadow();
    treeOutline.registerRequiredCSS('accessibility/accessibilityNode.css');
    treeOutline.registerRequiredCSS('components/objectValue.css');

    treeOutline.element.classList.add('hidden');
    this.element.appendChild(treeOutline.element);
    return treeOutline;
  }
};
