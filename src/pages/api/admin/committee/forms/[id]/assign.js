// pages/api/admin/committee/forms/[id]/assign.js
import { createServerSupabase } from "utils/supabaseServer";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    const { scope_type, scope_role, scope_code } = req.body;
    const token = req.headers.authorization?.replace("Bearer ", "");
    const supabase = createServerSupabase(token);

    console.log('=== ASSIGN API DEBUG ===');
    console.log('Form ID from URL:', id);
    console.log('Assignment data:', { scope_type, scope_role, scope_code });

    // Convert to integer
    const formId = parseInt(id);
    if (isNaN(formId)) {
      return res.status(400).json({ message: 'Invalid form ID' });
    }

    // Validate required fields
    if (!scope_type || !scope_role || !scope_code) {
      return res.status(400).json({ 
        message: 'Missing required fields: scope_type, scope_role, and scope_code are required' 
      });
    }

    // Verify user is authenticated
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    console.log('Authenticated user:', user.id);

    // Check committee role - updated for new scope system
    const { data: committeeRoles, error: committeeError } = await supabase
      .from('committee')
      .select('scope_type, scope_role, scope_code')
      .eq('user_id', user.id);

    console.log('User committee roles:', committeeRoles);

    // Check if user has admin role (roles 1,2,3 equivalent in new system)
    // Assuming: 1=convenor, 2=co_convenor, 3=member for admin purposes
    const hasRequiredRole = committeeRoles?.some(role => 
      ['convenor', 'co_convenor', 'member'].includes(role.scope_role)
    );

    console.log('User has required role:', hasRequiredRole);

    if (!hasRequiredRole) {
      return res.status(403).json({ 
        message: 'Not authorized. You need to be a committee member with appropriate role.' 
      });
    }

    // Step 1: Validate the scope_code exists in the correct table for the scope_type
    console.log('Validating scope assignment...');
    const { data: scopeValidation, error: validationError } = await supabase
      .rpc('validate_scope_assignment', {
        p_scope_code: scope_code,
        p_scope_type: scope_type
      });

    if (validationError) {
      console.error('Scope validation error:', validationError);
      return res.status(400).json({ 
        message: 'Scope validation failed',
        error: validationError.message 
      });
    }

    if (!scopeValidation) {
      return res.status(400).json({ 
        message: `Invalid scope assignment: ${scope_code} does not exist for type ${scope_type}` 
      });
    }

    console.log('Scope validation passed');

    // Step 2: Get the specific form to check current status
    const { data: currentForm, error: formError } = await supabase
      .from('committee_form')
      .select('*')
      .eq('id', formId)
      .single();

    console.log('Current form:', currentForm);

    if (formError || !currentForm) {
      return res.status(404).json({ 
        message: `Committee form not found. ID: ${formId}` 
      });
    }

    // Check if form is already approved
    if (currentForm.application_status === 'approved') {
      return res.status(400).json({ 
        message: 'Form is already approved. Cannot reassign.' 
      });
    }

    // Step 3: Update the committee_form with scope assignment
    console.log('Updating form with scope assignment...');
    const { data: updatedForm, error: updateError } = await supabase
      .from('committee_form')
      .update({ 
        scope_code: scope_code,
        scope_type: scope_type,
        scope_role: scope_role,
        application_status: 'approved',
        // Keep existing ward_code for backward compatibility during migration
        ward_code: scope_type === 'Ward' ? scope_code.split('-').pop() : null
      })
      .eq('id', formId)
      .select()
      .single();

    if (updateError) {
      console.error('Update failed:', updateError);
      
      // Check if it's a trigger error (committee approval trigger)
      if (updateError.message.includes('trigger')) {
        return res.status(400).json({ 
          message: 'Committee assignment failed. Please check if user is already a committee member elsewhere.',
          error: updateError.message 
        });
      }
      
      throw updateError;
    }

    console.log('Form updated successfully:', updatedForm);

    // Step 4: Verify committee record was created by trigger
    console.log('Verifying committee record creation...');
    const { data: committeeRecord, error: committeeCheckError } = await supabase
      .from('committee')
      .select('*')
      .eq('user_id', currentForm.user_id)
      .single();

    if (committeeCheckError) {
      console.warn('Committee record check failed:', committeeCheckError);
    } else {
      console.log('Committee record created:', committeeRecord);
    }

    res.status(200).json({ 
      success: true,
      message: 'Committee member assigned successfully!', 
      data: {
        form: updatedForm,
        committee: committeeRecord
      },
      assignment: {
        scope_type,
        scope_role, 
        scope_code
      }
    });

  } catch (error) {
    console.error('Error in assign API:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: error.message 
    });
  }
}