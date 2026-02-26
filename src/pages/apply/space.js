// pages/apply/space.js
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { LoginModal } from "@/components/auth/LoginModal";
import { ProtectedButton } from "@/components/auth/ProtectedButton";
import { spaceApplicationSchema } from "@/schemas/spaceApplication";
import { supabase } from "@/lib/supabase/client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

export default function ApplySpace() {
  const { user, loading: authLoading } = useAuth();
  const [showLogin, setShowLogin] = useState(false);

  const form = useForm({
    resolver: zodResolver(spaceApplicationSchema),
    defaultValues: {
      proposed_name: "",
      proposed_slug: "",
      description: "",
      contact_number: "",
      email: "",
      justification: "",
      website: "",
    },
  });

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
      </div>
    );
  }

  const onSubmit = async (values) => {
    if (!user) {
      setShowLogin(true);
      return;
    }

    try {
      const { error } = await supabase
        .from("community_application")
        .insert({
          ...values,
          applicant_user_id: user.id,
        });

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success("Space application submitted for review");
      form.reset();
    } catch (err) {
      toast.error("Something went wrong");
    }
  };

  const handleSubmitClick = () => {
    if (!user) {
      setShowLogin(true);
    } else {
      form.handleSubmit(onSubmit)();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center my-4 px-4 bg-muted/30">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <h1 className="text-xl font-semibold">
            Apply to Create a Space
          </h1>
          <p className="text-sm text-muted-foreground">
            Spaces document civic action within a geographic area.
          </p>
          
          {/* ✅ Moved this INSIDE the return statement */}
          {!user && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
              <p className="text-amber-800 text-sm">
                You need to sign in to submit an application
              </p>
            </div>
          )}
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmitClick();
              }}
              className="grid grid-cols-1 md:grid-cols-2 gap-5"
            >
              {/* Space name */}
              <FormField
                control={form.control}
                name="proposed_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Space Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Slug */}
              <FormField
                control={form.control}
                name="proposed_slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Space URL</FormLabel>
                    <FormControl>
                      <Input placeholder="walking-project" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="contact@space.org" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contact_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Number</FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        placeholder="+91 9876543210"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Website (optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="url"
                        placeholder="https://example.org"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Description (optional)</FormLabel>
                    <FormControl>
                      <Textarea rows={3} {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Justification */}
              <FormField
                control={form.control}
                name="justification"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>
                      Why should this space exist?
                    </FormLabel>
                    <FormControl>
                      <Textarea rows={4} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <ProtectedButton
                type="submit"
                className="md:col-span-2"
                disabled={form.formState.isSubmitting}
                loginMessage="You need to sign in to submit a space application"
              >
                {form.formState.isSubmitting ? "Submitting..." : (user ? "Submit Application" : "Sign in to Submit")}
              </ProtectedButton>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <LoginModal
        open={showLogin}
        onOpenChange={setShowLogin}
        redirectPath="/apply/space"
        message="You need to sign in to submit a space application"
      />
    </div>
  );
}