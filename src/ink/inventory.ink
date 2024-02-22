== inv( ->back )
+ [INVENTORY]
{Inventory == ():
    My pockets are empty.
    ->back
}
In my pockets, I have
{Inventory ? napkin: <> a napkin,}
<> and some pocket lint.

- ->back