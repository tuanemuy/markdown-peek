# Deeply Nested Structures

## Nested Lists (10 Levels)

- Level 1
  - Level 2
    - Level 3
      - Level 4
        - Level 5
          - Level 6
            - Level 7
              - Level 8
                - Level 9
                  - Level 10

## Nested Blockquotes (7 Levels)

> Level 1
> > Level 2
> > > Level 3
> > > > Level 4
> > > > > Level 5
> > > > > > Level 6
> > > > > > > Level 7

## Nested Lists Inside Blockquotes

> - Item 1
>   - Item 1.1
>     - Item 1.1.1
>       - Item 1.1.1.1
> - Item 2
>   1. Ordered 1
>      1. Ordered 1.1
>         - Mixed back to unordered

## Complex Nesting

> ### Blockquote with Heading
>
> - List in blockquote
>   - Nested list
>
>   > Nested blockquote in list in blockquote
>   >
>   > - List in nested blockquote
>   >   - Deeper list
>   >
>   > > Even deeper blockquote
>   > >
>   > > ```python
>   > > # Code in deeply nested blockquote
>   > > print("How deep can we go?")
>   > > ```

## Nested Task Lists

- [ ] Top level task
  - [ ] Sub task 1
    - [x] Sub-sub task 1.1 (done)
    - [ ] Sub-sub task 1.2
      - [x] Sub-sub-sub task 1.2.1 (done)
      - [ ] Sub-sub-sub task 1.2.2
  - [x] Sub task 2 (done)
    - [x] All children done
    - [x] This too

## Mixed Ordered and Unordered (Deep)

1. First
   - Unordered under ordered
     1. Ordered under unordered under ordered
        - Back to unordered
          1. And ordered again
             - And unordered
               1. Seven levels deep
