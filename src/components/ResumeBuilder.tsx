"use client";

import { useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Wand2, Briefcase, Download, Trash2, PlusCircle, BrainCircuit, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

import { templates } from "@/lib/templates";
import { handleGenerateResume, handleSuggestJobRoles } from "@/app/actions";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  linkedin: z.string().url("Invalid URL").optional().or(z.literal('')),
  summary: z.string().min(10, "Summary must be at least 10 characters"),
  skills: z.string().min(1, "Please list at least one skill"),
  education: z.array(z.object({
    institution: z.string().min(1, "Institution is required"),
    degree: z.string().min(1, "Degree is required"),
    graduationDate: z.string().min(1, "Graduation date is required"),
  })).min(1, "At least one education entry is required"),
  experience: z.array(z.object({
    title: z.string().min(1, "Job title is required"),
    company: z.string().min(1, "Company name is required"),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
    description: z.string().min(1, "Description is required"),
  })),
  projects: z.array(z.object({
    name: z.string().min(1, "Project name is required"),
    description: z.string().min(1, "Description is required"),
  })),
});

type FormData = z.infer<typeof formSchema>;

type JobSuggestions = {
  jobRoles: string[];
  skillsToHighlight: string[];
};

const ResumePreview = ({ content }: { content: string }) => {
  if (!content) {
    return (
      <div className="flex items-center justify-center h-full text-center text-muted-foreground">
        <div>
          <BrainCircuit className="mx-auto h-12 w-12 mb-4" />
          <p>Your generated resume will appear here.</p>
          <p className="text-sm">Fill in your details and click "Generate Resume".</p>
        </div>
      </div>
    );
  }

  const renderLine = (line: string, index: number) => {
    line = line.trim();
    if (line.startsWith('## ')) return <h2 key={index} className="text-2xl font-bold mt-6 mb-3 border-b pb-2">{line.substring(3)}</h2>;
    if (line.startsWith('### ')) return <h3 key={index} className="text-lg font-bold mt-4 mb-1">{line.substring(4)}</h3>;
    if (line.startsWith('- ')) return <li key={index} className="ml-5 list-disc">{line.substring(2)}</li>;
    if (line.startsWith('**') && line.endsWith('**')) return <p key={index} className="font-bold my-1">{line.substring(2, line.length-2)}</p>
    if (line) return <p key={index} className="text-sm">{line}</p>;
    return null;
  };

  return <div className="prose prose-sm max-w-none">{content.split('\n').map(renderLine)}</div>;
};

export function ResumeBuilder() {
  const [selectedTemplate, setSelectedTemplate] = useState(templates[0].id);
  const [generatedResume, setGeneratedResume] = useState("");
  const [jobSuggestions, setJobSuggestions] = useState<JobSuggestions | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "", email: "", phone: "", linkedin: "", summary: "", skills: "",
      education: [{ institution: "", degree: "", graduationDate: "" }],
      experience: [], projects: [],
    },
  });

  const { fields: eduFields, append: appendEdu, remove: removeEdu } = useFieldArray({ control: form.control, name: "education" });
  const { fields: expFields, append: appendExp, remove: removeExp } = useFieldArray({ control: form.control, name: "experience" });
  const { fields: projFields, append: appendProj, remove: removeProj } = useFieldArray({ control: form.control, name: "projects" });

  const onGenerate = async (data: FormData) => {
    setIsGenerating(true);
    setGeneratedResume("");
    const templateContent = templates.find(t => t.id === selectedTemplate)?.content || "";
    const input = {
      ...data,
      skills: data.skills.split(',').map(s => s.trim()),
      template: templateContent
    };
    const result = await handleGenerateResume(input);
    if (result.success) {
      setGeneratedResume(result.resume!);
      toast({ title: "Success", description: "Your resume has been generated." });
    } else {
      toast({ variant: "destructive", title: "Error", description: result.error });
    }
    setIsGenerating(false);
  };

  const onSuggest = async () => {
    const data = form.getValues();
    const isValid = await form.trigger();
    if (!isValid) {
      toast({ variant: "destructive", title: "Incomplete Form", description: "Please fill out all required fields before getting suggestions." });
      return;
    }
    setIsSuggesting(true);
    setJobSuggestions(null);
    const userProfile = `
      Summary: ${data.summary}
      Skills: ${data.skills}
      Education: ${data.education.map(e => `${e.degree} from ${e.institution}`).join(', ')}
      Experience: ${data.experience.map(e => `${e.title} at ${e.company}`).join(', ')}
      Projects: ${data.projects.map(p => p.name).join(', ')}
    `;
    const result = await handleSuggestJobRoles({ userProfile });
    if (result.success) {
      setJobSuggestions({ jobRoles: result.jobRoles!, skillsToHighlight: result.skillsToHighlight! });
      toast({ title: "Suggestions Ready", description: "We've found some job roles that might be a good fit." });
    } else {
      toast({ variant: "destructive", title: "Error", description: result.error });
    }
    setIsSuggesting(false);
  };

  const handlePrint = () => window.print();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
      <Card className="md:col-span-1">
        <CardHeader>
          <CardTitle>Your Information</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onGenerate)} className="space-y-6">
              <Accordion type="multiple" defaultValue={['item-1', 'item-2', 'item-3']} className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger className="font-semibold">Personal Details</AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-4">
                    <FormField name="name" control={form.control} render={({ field }) => <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField name="email" control={form.control} render={({ field }) => <FormItem><FormLabel>Email</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                        <FormField name="phone" control={form.control} render={({ field }) => <FormItem><FormLabel>Phone</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                    </div>
                    <FormField name="linkedin" control={form.control} render={({ field }) => <FormItem><FormLabel>LinkedIn Profile URL</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger className="font-semibold">Professional Summary</AccordionTrigger>
                  <AccordionContent className="pt-4">
                    <FormField name="summary" control={form.control} render={({ field }) => <FormItem><FormLabel>Summary</FormLabel><FormControl><Textarea rows={5} {...field} /></FormControl><FormMessage /></FormItem>} />
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                  <AccordionTrigger className="font-semibold">Skills</AccordionTrigger>
                  <AccordionContent className="pt-4">
                     <FormField name="skills" control={form.control} render={({ field }) => <FormItem><FormLabel>Skills (comma-separated)</FormLabel><FormControl><Textarea rows={3} {...field} /></FormControl><FormMessage /></FormItem>} />
                  </AccordionContent>
                </AccordionItem>

                 {/* Dynamic Fields Sections */}
                {['experience', 'education', 'projects'].map(section => {
                    const titleMap = {experience: "Work Experience", education: "Education", projects: "Projects"};
                    const fields = {experience: expFields, education: eduFields, projects: projFields}[section];
                    const removeFn = {experience: removeExp, education: removeEdu, projects: removeProj}[section];
                    const appendFn = {experience: () => appendExp({title: "", company: "", startDate: "", endDate: "", description: ""}), education: () => appendEdu({institution: "", degree: "", graduationDate: ""}), projects: () => appendProj({name: "", description: ""})}[section];

                    return(
                    <AccordionItem value={`item-${section}`} key={section}>
                      <AccordionTrigger className="font-semibold">{titleMap[section]}</AccordionTrigger>
                      <AccordionContent className="space-y-4 pt-4">
                        {fields.map((item, index) => (
                          <Card key={item.id} className="relative p-4 pt-8">
                            <Button variant="ghost" size="icon" className="absolute top-1 right-1 h-6 w-6" onClick={() => removeFn(index)}><Trash2 className="h-4 w-4" /></Button>
                            {section === 'education' && <>
                              <FormField name={`education.${index}.institution`} control={form.control} render={({ field }) => <FormItem><FormLabel>Institution</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                              <FormField name={`education.${index}.degree`} control={form.control} render={({ field }) => <FormItem className="mt-2"><FormLabel>Degree</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                              <FormField name={`education.${index}.graduationDate`} control={form.control} render={({ field }) => <FormItem className="mt-2"><FormLabel>Graduation Date</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                            </>}
                            {section === 'experience' && <>
                                <FormField name={`experience.${index}.title`} control={form.control} render={({ field }) => <FormItem><FormLabel>Job Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                                <FormField name={`experience.${index}.company`} control={form.control} render={({ field }) => <FormItem className="mt-2"><FormLabel>Company</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                                <div className="grid grid-cols-2 gap-4 mt-2">
                                <FormField name={`experience.${index}.startDate`} control={form.control} render={({ field }) => <FormItem><FormLabel>Start Date</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                                <FormField name={`experience.${index}.endDate`} control={form.control} render={({ field }) => <FormItem><FormLabel>End Date</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                                </div>
                                <FormField name={`experience.${index}.description`} control={form.control} render={({ field }) => <FormItem className="mt-2"><FormLabel>Description</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>} />
                            </>}
                            {section === 'projects' && <>
                                <FormField name={`projects.${index}.name`} control={form.control} render={({ field }) => <FormItem><FormLabel>Project Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                                <FormField name={`projects.${index}.description`} control={form.control} render={({ field }) => <FormItem className="mt-2"><FormLabel>Description</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>} />
                            </>}
                          </Card>
                        ))}
                        <Button type="button" variant="outline" size="sm" onClick={() => appendFn()}><PlusCircle className="mr-2 h-4 w-4" /> Add {titleMap[section]}</Button>
                      </AccordionContent>
                    </AccordionItem>
                    )
                })}
              </Accordion>
            </form>
          </Form>
        </CardContent>
      </Card>

      <div className="md:col-span-1 space-y-6 sticky top-8">
        <Card>
          <CardHeader><CardTitle>Templates & Actions</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            <div>
              <FormLabel>Select a Template</FormLabel>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-2">
                {templates.map(template => (
                  <button key={template.id} onClick={() => setSelectedTemplate(template.id)} className={`p-2 border-2 rounded-lg transition-all ${selectedTemplate === template.id ? 'border-primary ring-2 ring-primary' : 'border-border'}`}>
                    <img src={template.previewUrl} alt={template.name} data-ai-hint="resume template" className="w-full h-auto rounded-md object-cover" />
                    <p className="text-sm font-medium mt-2 text-center">{template.name}</p>
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button onClick={form.handleSubmit(onGenerate)} disabled={isGenerating} className="w-full bg-accent hover:bg-accent/90">
                {isGenerating ? <Loader2 className="animate-spin mr-2" /> : <Wand2 className="mr-2" />} Generate Resume
              </Button>
              <Button onClick={onSuggest} disabled={isSuggesting} variant="outline" className="w-full">
                {isSuggesting ? <Loader2 className="animate-spin mr-2" /> : <Briefcase className="mr-2" />} Suggest Job Roles
              </Button>
              <Button onClick={handlePrint} variant="outline" className="w-full" disabled={!generatedResume}>
                <Download className="mr-2" /> Download
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Tabs defaultValue="preview" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="preview">Resume Preview</TabsTrigger>
            <TabsTrigger value="suggestions">Job Suggestions</TabsTrigger>
          </TabsList>
          <TabsContent value="preview">
             <div id="resume-preview-wrapper">
                <Card id="resume-preview" className="h-[70vh] overflow-y-auto p-6 bg-white dark:bg-card">
                  {isGenerating ? 
                  <div className="flex items-center justify-center h-full"><Loader2 className="h-8 w-8 animate-spin text-primary"/></div> 
                  : <ResumePreview content={generatedResume} />}
                </Card>
             </div>
          </TabsContent>
          <TabsContent value="suggestions">
            <Card className="h-[70vh] overflow-y-auto p-6">
              {isSuggesting && <div className="flex items-center justify-center h-full"><Loader2 className="h-8 w-8 animate-spin text-primary"/></div>}
              {jobSuggestions ? (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Suggested Job Roles</h3>
                    <div className="flex flex-wrap gap-2">
                      {jobSuggestions.jobRoles.map(role => <Badge key={role} variant="secondary">{role}</Badge>)}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Skills to Highlight</h3>
                     <div className="flex flex-wrap gap-2">
                      {jobSuggestions.skillsToHighlight.map(skill => <Badge key={skill}>{skill}</Badge>)}
                    </div>
                  </div>
                </div>
              ) : !isSuggesting && (
                 <div className="flex items-center justify-center h-full text-center text-muted-foreground">
                  <div>
                    <Briefcase className="mx-auto h-12 w-12 mb-4" />
                    <p>AI-powered job suggestions will appear here.</p>
                  </div>
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
