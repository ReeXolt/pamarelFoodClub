
"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreVertical, Edit, Trash2 } from "lucide-react"


export function AddressCard({ address, onEdit, onSetDefault }) {
  return (
    <Card className="flex flex-col">
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <div className="flex-1">
            <CardTitle className="text-lg">{address.firstName} {address.lastName}</CardTitle>
            <CardDescription className="pt-1">{address.phone}</CardDescription>
        </div>
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4"/>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onEdit}>
                    <Edit className="mr-2 h-4 w-4" />
                    <span>Edit</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    <span>Delete</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="flex-grow text-sm text-muted-foreground">
        <p>{address.address}</p>
        <p>{address.city}, {address.state} {address.zip}</p>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        {address.isDefault ? (
          <Badge>Default</Badge>
        ) : (
          <Button variant="secondary" size="sm" onClick={onSetDefault}>Set as Default</Button>
        )}
      </CardFooter>
    </Card>
  )
}
