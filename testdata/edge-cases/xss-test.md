# XSS and Security Edge Cases

These patterns should be safely escaped by the renderer.

## Script Injection Attempts

<script>alert('XSS')</script>

<img src="x" onerror="alert('XSS')">

<a href="javascript:alert('XSS')">Click me</a>

<iframe src="https://evil.com"></iframe>

## Event Handler Injection

<div onmouseover="alert('XSS')">Hover me</div>

<input onfocus="alert('XSS')" autofocus>

<body onload="alert('XSS')">

## URL Injection

[Link](javascript:alert('XSS'))

[Link](data:text/html,<script>alert('XSS')</script>)

[Link](vbscript:alert('XSS'))

## Markdown-based Injection

![alt](https://example.com/image.png"onload="alert('XSS'))

[text](https://example.com"onclick="alert('XSS'))

## CSS Injection

<div style="background:url('javascript:alert(1)')">test</div>

<div style="width:expression(alert('XSS'))">test</div>

## Encoded Characters

&#60;script&#62;alert('XSS')&#60;/script&#62;

%3Cscript%3Ealert('XSS')%3C/script%3E

## All of these should render as harmless text, not execute any scripts.
